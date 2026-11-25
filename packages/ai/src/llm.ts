/**
 * LLM 高层 API 模块：提供对模型的一次性调用与多轮循环调用。
 *
 * 对外导出的核心函数：
 *   - generate：单次生成（非流式），一次性拿到完整响应；
 *   - stream：单次流式调用，逐事件返回；
 *   - loop：多轮循环——模型调用工具后再把结果喂回去，直到给出最终答复；
 *   - compact / 相关类型：上下文压缩（把过长对话压成摘要）。
 *
 * 分层关系：本模块负责“组装请求 + 驱动循环”，底层 IO 交给 LLMClient / route，
 * 消息变换复用 loop.ts 的纯函数，工具执行复用 tool-runtime.ts。
 *
 * 结构化输出：传入 schema 时，会注入一个隐藏工具 generate_object，
 * 强制模型通过该工具作答，再把参数解码成 object。
 */
import { Effect, JsonSchema, Schema, Stream } from "effect"
import { tryRequest } from "./media-model.js"
import {
  LLMClient,
  Service,
  canCompact,
  compactRequest,
  type CheckpointRequest,
  type CompactionRequest,
  type EndpointCompactOptions,
  type StreamOptions,
  type TriggerCompactOptions,
} from "./route/client.js"
import {
  InvalidProviderOutputError,
  InvalidRequestError,
  mergeGeneration,
  AIError,
  LLMEvent,
  LLMResponse,
  ResponseFold,
  Message,
  LanguageModel,
  SystemPart,
  type BaseRequest,
  type CachePolicy,
  type CompactionCheckpointResponse,
  type CompactionResponse,
  type Finish,
  ToolChoice,
  ToolEntry,
  Usage,
  type LanguageModelProviderOptions,
  type GenerationOptionsFields,
  type LLMRequest,
  type ToolEntryInput,
  withPartial,
} from "./schema/index.js"
import { tool, type ExecutableTool, type Tool, type ToolSchema } from "./tool.js"
import { runTools } from "./tool-runtime.js"
import { addUsage, nextRequest, pendingCalls } from "./loop.js"
import { foldTools } from "./tool-updates.js"

/** Input accepted by `ai.request`, `ai.generate`, `ai.stream` and `ai.compact`. An `LLMRequest` is also a valid input. */
export type LLMRequestInput<Model extends LanguageModel = LanguageModel> = TextRequestFields<Model> & PromptOrMessages

/**
 * 二选一：要么给一句 `prompt`（单条用户消息），要么给完整的 `messages` 对话历史。
 * 用 never 做互斥，杜绝同时传两者的情况。
 */
export type PromptOrMessages =
  | { readonly prompt: Message.UserContentInput; readonly messages?: never }
  | { readonly messages: ReadonlyArray<Message | Message.Input>; readonly prompt?: never }

interface TextRequestFields<Model extends LanguageModel>
  extends BaseRequest<Model, NoInfer<LanguageModelProviderOptions<Model>>>,
    GenerationOptionsFields {
  readonly id?: string
  readonly system?: string | SystemPart | ReadonlyArray<SystemPart>
  /**
   * 按数组顺序发送给模型的工具。既可传 tool(...) 造出的可执行工具，
   * 也可传托管工具的 wire 条目。等价于在历史开头放一条 Message.tools({ add: tools })。
   */
  readonly tools?: ReadonlyArray<Tool | ToolEntryInput>
  readonly toolChoice?: ToolChoice.Input
  readonly cache?: CachePolicy
  /** 稳定的缓存亲和键：支持提供方管理提示词缓存的协议用它保持缓存命中。 */
  readonly promptCacheKey?: string
  /** 在每个提供方原始帧被解析之前，额外发出一个 `raw` 事件（调试用）。 */
  readonly includeRaw?: boolean
}

/** 结构化输出的 schema：Effect Schema 能解码并推导 object 类型；裸 JSON Schema 只能得到 unknown。 */
export type OutputSchema = ToolSchema<any> | JsonSchema.JsonSchema

export type OutputType<S extends OutputSchema> = S extends Schema.Top ? Schema.Schema.Type<S> : unknown

export type ObjectResponse<T> = LLMResponse & { readonly object: T }

/** Stream events for a request with `schema`: the `finish` event carries the decoded `object`. */
export type ObjectEvent<T> = Exclude<LLMEvent, Finish> | (Finish & { readonly object: T })

/** Loop events for a request with `schema`: the loop's `finish` event carries the decoded `object`. */
export type LoopObjectEvent<T> = Exclude<LLMEvent, Finish> | (Finish & { readonly object?: T })

/**
 * 单次生成（非流式）：跑一次模型调用，拿到完整响应。
 * 传 schema 时会强制模型通过 generate_object 工具作答，并把参数解码成 object 附加到响应上。
 */
export function generate<const Model extends LanguageModel, S extends OutputSchema>(
  input: LLMRequestInput<Model> & { readonly schema: S },
  options?: StreamOptions,
): Effect.Effect<ObjectResponse<OutputType<S>>, AIError, Service>
export function generate<const Model extends LanguageModel>(
  input: LLMRequestInput<Model>,
  options?: StreamOptions,
): Effect.Effect<LLMResponse, AIError, Service>
export function generate(input: Input, options?: StreamOptions) {
  return prepare(input).pipe(
    Effect.flatMap(({ request, output }) =>
      LLMClient.generate(request, options).pipe(
        Effect.flatMap((response) =>
          output === undefined
            ? Effect.succeed(response)
            : decodeObject(output, response).pipe(Effect.map((object) => Object.assign(response, { object }))),
        ),
      ),
    ),
  )
}

/**
 * 单次流式调用：逐事件返回模型输出。
 * finish 事件携带助手消息与用量；传 schema 时还带解码后的 object。
 * 与 loop 的区别：stream 只调用模型一次，不执行工具、不进入多轮。
 */
export function stream<const Model extends LanguageModel, S extends OutputSchema>(
  input: LLMRequestInput<Model> & { readonly schema: S },
  options?: StreamOptions,
): Stream.Stream<ObjectEvent<OutputType<S>>, AIError, Service>
export function stream<const Model extends LanguageModel>(
  input: LLMRequestInput<Model>,
  options?: StreamOptions,
): Stream.Stream<LLMEvent, AIError, Service>
export function stream(input: Input, options?: StreamOptions) {
  return Stream.unwrap(
    prepare(input).pipe(
      Effect.map(({ request, output }) =>
        stepStream(request, undefined, options, (step) =>
          Stream.fromEffect(finishStep(step, step.response.usage, output)),
        ),
      ),
    ),
  )
}

export type LLMLoopInput<Model extends LanguageModel = LanguageModel> = Omit<TextRequestFields<Model>, "tools"> &
  PromptOrMessages & {
    readonly tools: ReadonlyArray<ExecutableTool>
    /**
     * 每一步（含工具调用）之后都会调用它；返回 true 则结束循环，且不再执行本步的工具。
     * 可用于自定义提前终止条件，例如达到某个步数或累计用量阈值。
     */
    readonly until?: (state: { readonly steps: ReadonlyArray<LLMResponse> }) => boolean
  }

/**
 * 多轮循环调用：流式输出模型响应，并在每轮之间执行模型请求的工具调用，
 * 直到某一步没有需要客户端执行的工具、输出触顶、或 until 返回 true。
 *
 * 行为要点：
 *   - 输入非法 JSON 的工具调用会收到 error 结果，模型可据此重试；
 *   - 强制 toolChoice 仅对第一步生效；
 *   - 每步的 step-start / step-finish 携带步号与用量；整个循环只有一个 finish，
 *     它携带最后一步的结束原因和消息，用量是跨步累计值；
 *   - 传 schema 时，模型最终调用隐藏答案工具 generate_object，在 finish 上解码出 object。
 *
 * 这就是“智能体循环”在 AI SDK 层的实现；opencode 核心的 session runner 在其之上
 * 又包了一层持久化、权限与重试（见 packages/core/src/session/runner）。
 */
export function loop<const Model extends LanguageModel, S extends OutputSchema>(
  input: LLMLoopInput<Model> & { readonly schema: S },
  options?: StreamOptions,
): Stream.Stream<LoopObjectEvent<OutputType<S>>, AIError, Service>
export function loop<const Model extends LanguageModel>(
  input: LLMLoopInput<Model>,
  options?: StreamOptions,
): Stream.Stream<LLMEvent, AIError, Service>
export function loop(input: LLMLoopInput & { readonly schema?: OutputSchema }, options?: StreamOptions) {
  const { tools, until, ...rest } = input
  return Stream.unwrap(
    prepare({ ...rest, tools }).pipe(
      // Untyped callers may omit `tools`.
      Effect.map(({ request, output }) =>
        driveLoop(
          { tools: runnableTools(tools ?? [], input.messages ?? []), until, output, options },
          request,
          [],
          undefined,
        ),
      ),
    ),
  )
}

/**
 * 汇总“实际可运行”的工具列表。
 * 除了入参里的 tools，还要扫描对话历史中由 Message.tools(...) 动态添加/移除的工具：
 * 同名工具以最后一次变更为准（后面的 add 覆盖、remove 删除）。最后只保留真正带定义的可执行工具。
 */
const runnableTools = (tools: ReadonlyArray<Tool>, messages: ReadonlyArray<Message | Message.Input>) =>
  messages
    .reduce<ReadonlyArray<Tool | ToolEntryInput>>(
      (current, message) =>
        message.role === "system" && message.tools !== undefined
          ? foldTools(
              current,
              message.tools.add ?? [],
              (message.tools.remove ?? []).map((item) => (typeof item === "string" ? item : item.name)),
            )
          : current,
      tools,
    )
    .filter((item): item is Tool => "_definition" in item)

export { collect, type Collected, type CollectResult } from "./loop.js"

/** 一个已完成步骤的封装：完整响应 + 对应的 finish 事件。 */
interface Step {
  readonly response: LLMResponse
  readonly finish: Finish
}

/**
 * 对模型做一次流式调用，但把 finish 事件“扣住”不立即发出。
 *
 * 为什么扣住：finish 之后往往要接着执行工具、发起下一轮，所以把“本步完成”作为一个回调点
 * （after），由调用方决定本步之后流什么——单次 stream 直接发 finish，loop 则先跑工具。
 * 传入 index 时会给 step-start / step-finish 打上步号，便于 UI 展示多轮进度。
 * 底层用 ResponseFold 累积事件；若流中途报错，用 withPartial 把已产出部分附在错误上。
 */
const stepStream = (
  request: LLMRequest,
  index: number | undefined,
  options: StreamOptions | undefined,
  after: (step: Step) => Stream.Stream<LLMEvent, AIError, Service>,
): Stream.Stream<LLMEvent, AIError, Service> =>
  // Stream.suspend 保证每次订阅都重新创建累积状态，避免多次订阅互相污染
  Stream.suspend(() => {
    let state = ResponseFold.empty()
    let finish: Finish | undefined
    return LLMClient.stream(request, options).pipe(
      Stream.map((event) =>
        index !== undefined && (event.type === "step-start" || event.type === "step-finish")
          ? { ...event, index }
          : event,
      ),
      // 旁路累积每个事件，并单独记住 finish
      Stream.tap((event) =>
        Effect.sync(() => {
          state = ResponseFold.reduce(state, event)
          if (event.type === "finish") finish = event
        }),
      ),
      // finish 不直接发给下游，交给下面 concat 里的 after 决定
      Stream.filter((event) => event.type !== "finish"),
      // 出错时把已经积累的部分结果附在错误上，便于上层展示半截输出
      Stream.mapError((error) => withPartial(error, ResponseFold.partial(state))),
      Stream.concat(
        Stream.suspend(() => {
          const response = ResponseFold.complete(state)
          // 本步完整结束才调用 after；否则流（异常中断）到此为止
          return response && finish ? after({ response, finish }) : Stream.empty
        }),
      ),
    )
  })

/**
 * 构造结束整个 stream/loop 的 finish 事件。
 * 它携带最后一步的消息、累计用量；若有结构化输出工具，则把响应解码成 object 一并附上。
 */
const finishStep = (
  step: Step,
  usage: Usage | undefined,
  output: Tool | undefined,
): Effect.Effect<LLMEvent, AIError> => {
  const event: Finish = { ...step.finish, usage, message: step.response.message }
  if (output === undefined) return Effect.succeed(event)
  return decodeObject(output, step.response).pipe(Effect.map((object) => ({ ...event, object })))
}

/** 循环过程中保持不变的上下文：工具集、终止回调、结构化输出工具、流式选项。 */
interface LoopContext {
  readonly tools: ReadonlyArray<Tool>
  readonly until: LLMLoopInput["until"]
  readonly output: Tool | undefined
  readonly options: StreamOptions | undefined
}

/**
 * 驱动多轮循环的核心（递归函数）。
 *
 * 每一轮：
 *   1. stepStream 跑一次模型调用，步号为已完成步数；
 *   2. 本步完成后累计用量、用 pendingCalls 判断下一步要不要执行工具；
 *   3. 若无可调用工具，或 until 判定终止 → 发出 finish 结束循环；
 *   4. 否则并发执行工具，把工具结果事件发出去，再用 nextRequest 生成下一轮请求，
 *      带着累积的 steps/usage 递归调用自身。
 *
 * 注意这是“流中嵌流”的递归：用 Stream.unwrap / concat 把所有轮的事件串成一条连续的流，
 * 调用方只看到一条事件序列，感知不到内部递归。
 */
const driveLoop = (
  context: LoopContext,
  request: LLMRequest,
  steps: ReadonlyArray<LLMResponse>,
  usage: Usage | undefined,
): Stream.Stream<LLMEvent, AIError, Service> =>
  stepStream(request, steps.length, context.options, (step) => {
    // 累计用量，并判断本步之后该做什么
    const total = addUsage(usage, step.response.usage)
    const calls = pendingCalls(step.response, context.output && OBJECT_TOOL)
    const done = [...steps, step.response]
    // 终止：没有待执行调用，或 until 显式要求结束。注意此时才解码 object（若启用结构化输出）
    if (calls.length === 0 || context.until?.({ steps: done }))
      return Stream.fromEffect(finishStep(step, total, calls.length === 0 ? context.output : undefined))
    // 继续：并发执行所有工具调用
    return Stream.unwrap(
      runTools(context.tools, calls).pipe(
        Effect.map((results) =>
          // 先把工具结果事件发给下游，让 UI 能看到工具执行过程
          Stream.fromIterable(results.flatMap((result) => result.events)).pipe(
            // 工具结果之后拼接下一轮递归：nextRequest 把本轮消息和结果写进请求历史
            Stream.concat(
              driveLoop(
                context,
                nextRequest(request, step.response, calls, results, context.output !== undefined),
                done,
                total,
              ),
            ),
          ),
        ),
      ),
    )
  })

/** 隐藏的“答案工具”名：结构化输出时模型通过它返回 object。 */
const OBJECT_TOOL = "generate_object"

type Input = LLMRequestInput & { readonly schema?: OutputSchema }

/**
 * 准备请求：把高层输入（prompt/messages/tools/schema）转成底层 LLMRequest。
 *
 * 结构化输出的处理是关键：当传了 schema，会额外注册一个隐藏工具 generate_object，
 * 强制模型调用它作答（若没有其它工具就点名该工具，否则只要求“必须调用某个工具”）。
 * 这样 object 就藏在工具参数里，随后由 decodeObject 解码。
 * 另外会检查工具名重复——同名工具会让模型无法区分，属于调用方错误。
 */
const prepare = (input: Input) => {
  const { schema, ...rest } = input
  return tryRequest(() => {
    const description = "Return the structured result by calling this tool."
    const output: Tool | undefined =
      schema === undefined ? undefined : tool({ name: OBJECT_TOOL, description, input: schema })
    const tools = rest.tools ?? []
    const built = request(
      output === undefined
        ? rest
        : {
            ...rest,
            tools: [...tools, output],
            // 无其它工具时直接指定答案工具；有其它工具时强制“任选一个工具调用”
            toolChoice: tools.length === 0 ? ToolChoice.named(OBJECT_TOOL) : new ToolChoice({ type: "required" }),
          },
    )
    // 重复工具名会让模型混淆，提前报错
    const duplicate = built.tools.find(
      (entry, index) => built.tools.findIndex((other) => other.name === entry.name) !== index,
    )
    if (duplicate) throw new Error(`Duplicate tool name: ${duplicate.name}`)
    return { request: built, output }
  })
}

/**
 * 从模型响应里解码结构化输出 object。
 * 先找到强制调用的 generate_object 工具调用；三种失败都报成 InvalidProviderOutput：
 *   1. 输出被 token 上限截断——此时调用参数是不完整的，解码错误会掩盖真正原因，故优先判断；
 *   2. schema 解码参数失败；
 *   3. 模型压根没调用那个强制工具。
 */
const decodeObject = (output: Tool, response: LLMResponse) => {
  const call = response.toolCalls.find((event) => event.name === OBJECT_TOOL)
  const invalid = (message: string, cause?: unknown) =>
    new AIError({ reason: new InvalidProviderOutputError({ message, cause }), partial: response })
  // 被截断的调用参数为空/不完整，优先报“触顶”而不是让人误解为 schema 错误
  if (response.finishReason.normalized === "length")
    return Effect.fail(invalid("output hit the token limit before the forced tool call completed"))
  if (call)
    return output
      ._decode(call.input)
      .pipe(Effect.mapError((error) => invalid(`schema decode failed: ${error.message}`, error)))
  return Effect.fail(invalid(`model did not call the forced \`${OBJECT_TOOL}\` tool`))
}

/**
 * 把高层文本请求输入规范化为底层 LLMRequest。
 * prompt 会被转成单条用户消息；工具定义统一抽出 _definition；生成参数通过 mergeGeneration 合并。
 * prompt 与 messages 必须恰好提供一个，否则报错。
 */
export const request = <const Model extends LanguageModel>(input: LLMRequestInput<Model>): LLMRequest<Model> => {
  // 两者都给或都不给都非法（undefined 状态相同即非法）
  if ((input.prompt === undefined) === (input.messages === undefined))
    throw new AIError({
      reason: new InvalidRequestError({ message: "Pass exactly one of `prompt` or `messages`, not both or neither" }),
    })
  return {
    id: input.id,
    model: input.model,
    system: SystemPart.content(input.system),
    messages: input.prompt === undefined ? (input.messages ?? []).map(Message.make) : [Message.user(input.prompt)],
    tools: input.tools?.map((item) => ("_definition" in item ? item._definition : ToolEntry.make(item))) ?? [],
    toolChoice: input.toolChoice ? ToolChoice.make(input.toolChoice) : undefined,
    ...mergeGeneration(input),
    providerOptions: input.providerOptions,
    headers: input.headers,
    fetch: input.fetch,
    timeout: input.timeout,
    http: input.http,
    cache: input.cache,
    promptCacheKey: input.promptCacheKey,
    includeRaw: input.includeRaw,
  }
}

/**
 * 上下文压缩：把过长的对话历史压成摘要，或创建一个 checkpoint 触发压缩。
 * 先规范化输入再做底层压缩请求（具体机制由 route/client 的 compactRequest 处理）。
 */
export function compact(
  input: CheckpointRequest,
  options: TriggerCompactOptions,
): Effect.Effect<CompactionCheckpointResponse, AIError, Service>
export function compact(
  input: CompactionRequest,
  options?: EndpointCompactOptions,
): Effect.Effect<CompactionResponse, AIError, Service>
export function compact(
  input: CheckpointRequest | CompactionRequest,
  options?: EndpointCompactOptions | TriggerCompactOptions,
) {
  return tryRequest(() => request<LanguageModel>(input)).pipe(
    Effect.flatMap((normalized) => compactRequest(normalized, options)),
  )
}

export { canCompact }

export * as LLM from "./llm.js"
