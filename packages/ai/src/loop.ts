/**
 * LLM 循环的核心工具函数集（纯函数模块）。
 *
 * 这个文件本身不运行循环——真正驱动“调用模型→执行工具→再次调用模型”的多轮循环在
 * llm.ts 的 driveLoop 中。本文件提供的是循环过程中被反复调用的一组无状态工具：
 *   - pendingCalls：判断本轮模型响应里哪些工具调用还需要客户端执行；
 *   - stepMessages：把工具执行结果回填成对话消息；
 *   - nextRequest：把本轮消息追加到请求里，生成下一轮模型请求；
 *   - addUsage：跨步累计 token 用量与费用；
 *   - collect：把事件流折叠成最终汇总结果 Collected。
 *
 * 之所以把这些拆成纯函数，是因为它们只做“响应→消息→请求”的数据变换，
 * 没有 IO 和副作用，便于单独测试（见 test/loop-steps.test.ts），
 * 也让 stream（单次调用）与 loop（多轮调用）能复用同一套消息折叠逻辑。
 */
import { Effect, Stream } from "effect"
import {
  AIError,
  AssistantMessage,
  InvalidProviderOutputError,
  LLMResponse,
  ResponseFold,
  Message,
  Usage,
  LLMEvent,
  ToolCallPart,
  ToolChoice,
  type Finish,
  type FinishReasonDetails,
  type LLMRequest,
  type ToolInputError,
} from "./schema/index.js"
import type { DispatchResult, PendingCall } from "./tool-runtime.js"

/**
 * 挑出“客户端需要在下一轮之前执行/回应”的工具调用。
 *
 * 判定规则（顺序即优先级）：
 *   1. 本轮因输出 token 触顶（length）而结束：不再执行任何工具，因为调用列表可能已被截断，
 *      执行半截调用没有意义；
 *   2. 出现了答案工具 answerTool（结构化输出用的 generate_object）：本轮即为最终轮，
 *      即使同一轮还有其它工具调用也一律不再执行；
 *   3. 其余情况返回两类待处理调用：
 *      a. 模型发出、且不是由模型提供方自己执行的普通工具调用（providerExecuted !== true），
 *         托管工具（提供方已代跑）跳过；
 *      b. 输入不是合法 JSON 的调用：携带 error 字段，客户端不真正执行它，而是把这个错误
 *         作为工具结果回传给模型，让模型有机会重试。
 *
 * @param response 本轮模型的完整响应
 * @param answerTool 可选的答案工具名；一旦被调用就终止循环
 * @returns 待处理调用列表；调用顺序：普通调用在前，非法 JSON 回放调用在后
 */
export const pendingCalls = (response: LLMResponse, answerTool?: string): ReadonlyArray<PendingCall> => {
  // 输出被 token 上限截断，调用可能不完整，直接放弃执行
  if (response.finishReason.normalized === "length") return []
  // 答案工具出现即视为最终答复（即便同时调用了其它工具）
  if (answerTool !== undefined && response.toolCalls.some((call) => call.name === answerTool)) return []
  return [
    // 只执行需要客户端处理的调用；提供方已代跑的托管工具跳过
    ...response.toolCalls.filter((call) => call.providerExecuted !== true).map((call) => ({ call })),
    // 非法 JSON 输入：生成一个带 error 的回放调用，让模型拿到错误后重试
    ...response.events.filter(LLMEvent.is.toolInputError).map((event) => ({
      call: invalidCall(event),
      error: `Invalid tool arguments: the input is not valid JSON. Received: ${event.raw}`,
    })),
  ]
}

/**
 * 为“输入不是合法 JSON”的错误事件构造一个回放用的工具调用。
 * 模型提供方要求工具输入必须是对象，所以这里用空对象 {} 占位；真正要回传的是 error 文本。
 */
const invalidCall = (event: ToolInputError) =>
  ToolCallPart.make({ id: event.id, name: event.name, namespace: event.namespace, input: {} })

/**
 * 把回放调用补进助手消息。
 * 原响应里的非法 JSON 调用只产生了错误事件、没有正常的工具调用部分，
 * 若不补上，后面回填的 tool 结果消息就会找不到对应的 call，破坏对话结构。
 */
const withInvalidCalls = (message: AssistantMessage, calls: ReadonlyArray<ToolCallPart>) =>
  calls.length === 0 ? message : new AssistantMessage({ ...message, content: [...message.content, ...calls] })

/**
 * 构造本轮要追加到对话里的消息序列：助手消息 + 每个调用对应一条工具结果消息。
 *
 * 顺序严格按调用顺序排列，保证 id 一一对应：
 *   1. 助手消息（若含非法 JSON 调用，先把它补进消息内容）；
 *   2. 每个 pending call 各一条 tool 消息，携带执行结果。
 *
 * @param response 本轮模型响应
 * @param calls 待处理调用（来自 pendingCalls）
 * @param results 与 calls 一一对应的执行结果
 */
export const stepMessages = (
  response: LLMResponse,
  calls: ReadonlyArray<PendingCall>,
  results: ReadonlyArray<DispatchResult>,
): ReadonlyArray<Message> => [
  // 助手消息：只把“带 error 的回放调用”补进去，正常调用本就在响应消息里
  withInvalidCalls(
    response.message,
    calls.flatMap((item) => (item.error === undefined ? [] : [item.call])),
  ),
  // 每个调用一条工具结果消息；results 与 calls 按下标对齐
  ...calls.map((item, i) =>
    Message.tool({
      id: item.call.id,
      name: item.call.name,
      namespace: item.call.namespace,
      result: results[i].result,
      providerMetadata: item.call.providerMetadata,
    }),
  ),
]

/**
 * 生成 `response` 之后那一步的模型请求：把本轮消息与工具结果追加到历史。
 * 调用方强制指定的 `toolChoice` 只对第一步生效；`keepForcedChoice`（答案工具场景）下则保留。
 *
 * @param request 本轮请求
 * @param response 本轮响应
 * @param calls 待处理调用
 * @param results 与 calls 对应的执行结果
 * @param keepForcedChoice 是否保留强制工具选择（结构化输出时需要）
 */
export const nextRequest = (
  request: LLMRequest,
  response: LLMResponse,
  calls: ReadonlyArray<PendingCall>,
  results: ReadonlyArray<DispatchResult>,
  keepForcedChoice: boolean,
): LLMRequest => ({
  ...request,
  // 强制工具选择（required/tool）只应用于第一步，否则模型会被一直逼着调用工具；
  // keepForcedChoice=true 时（答案工具场景）保留，确保结构化输出最终能落地。
  toolChoice:
    !keepForcedChoice && (request.toolChoice?.type === "required" || request.toolChoice?.type === "tool")
      ? new ToolChoice({ type: "auto", disableParallelToolUse: request.toolChoice.disableParallelToolUse })
      : request.toolChoice,
  // 关键：把本轮的助手消息和工具结果追加到历史，模型下一轮才能看到自己调用工具的结果
  messages: [...request.messages, ...stepMessages(response, calls, results)],
})

/**
 * 跨步累计用量（token 计数与费用）。
 *
 * 注意 contextTokens（当前上下文大小）是个例外：它描述“最近一次调用”的状态，
 * 不是累计量，所以取最新一步的值，而不是把各步相加。
 * 其余字段（输入/输出/缓存读写/推理 token、费用、总 token）逐项求和。
 */
export const addUsage = (total: Usage | undefined, step: Usage | undefined) => {
  if (total === undefined || step === undefined) return total ?? step
  const sum = (
    key:
      | "inputTokens"
      | "outputTokens"
      | "nonCachedInputTokens"
      | "cacheReadInputTokens"
      | "cacheWriteInputTokens"
      | "reasoningTokens"
      | "totalTokens"
      | "cost",
  ) => (total[key] === undefined && step[key] === undefined ? undefined : (total[key] ?? 0) + (step[key] ?? 0))
  return new Usage({
    // 上下文大小取最新一步，不做累加（原文：描述最近一次调用，而非运行总量）
    contextTokens: step.contextTokens ?? total.contextTokens,
    inputTokens: sum("inputTokens"),
    outputTokens: sum("outputTokens"),
    nonCachedInputTokens: sum("nonCachedInputTokens"),
    cacheReadInputTokens: sum("cacheReadInputTokens"),
    cacheWriteInputTokens: sum("cacheWriteInputTokens"),
    reasoningTokens: sum("reasoningTokens"),
    totalTokens: sum("totalTokens"),
    cost: sum("cost"),
  })
}

/**
 * collect 的汇总结果：把 `stream` 或 `loop` 产生的事件流折叠成一个最终值。
 *
 * 常用于测试和非流式调用方——不必逐个处理事件，直接拿到完整答复。
 */
export interface Collected {
  /** 最后一步的文本内容。 */
  readonly text: string
  /** 每次模型调用对应一个响应，按调用顺序排列。 */
  readonly steps: ReadonlyArray<LLMResponse>
  /** 每步的助手消息及其工具结果，可直接追加到请求的消息列表。 */
  readonly messages: ReadonlyArray<Message>
  /** 终止 finish 事件的用量；对 loop 而言是跨步累计值。 */
  readonly usage?: Usage
  readonly finishReason: FinishReasonDetails
}

/** 从事件类型里取出 finish 事件的类型。 */
type FinishOf<Event> = Extract<Event, { readonly type: "finish" }>

/**
 * 当 stream 是以 `schema`（结构化输出）启动时，结果里还会带一个解码后的 object。
 * 这里用条件类型判断 finish 事件是否含 object 字段。
 */
export type CollectResult<Event> = "object" extends keyof FinishOf<Event>
  ? Collected & Pick<FinishOf<Event>, "object">
  : Collected

/**
 * 把 `stream` 或 `loop` 产生的事件流跑到结束，并折叠成最终结果。
 *
 * 折叠过程要点：
 *   - 用 ResponseFold 逐个事件累积出每一步的响应，遇到 step-finish / finish 时用 close 收口；
 *   - finish 与下一个 step-start 之间的 tool-result 事件由循环执行工具产生，单独归入 messages；
 *   - 若流结束却没有 finish 事件，报 incomplete-stream 错误（防止半截流被当成成功）。
 */
export function collect<Event extends LLMEvent, E, R>(
  events: Stream.Stream<Event, E, R>,
): Effect.Effect<CollectResult<Event>, E | AIError, R>
export function collect<E, R>(
  events: Stream.Stream<LLMEvent, E, R>,
): Effect.Effect<Collected & { readonly object?: unknown }, E | AIError, R> {
  return Effect.suspend(() => {
    // steps：每步一个响应；messages：交错的助手消息与工具结果消息
    const steps: LLMResponse[] = []
    const messages: Message[] = []
    // ResponseFold 是一个累积器，把流式事件逐步聚合成一条完整响应
    let step = ResponseFold.empty()
    // 标记是否处于“本步已结束、下一步未开始”的间隙；这个间隙里的 tool-result 来自循环执行工具
    let betweenSteps = false
    // 最近一条助手消息在 messages 里的下标，以及其中输入非法的调用（用于回填回放调用）
    let assistant = -1
    let invalid: ReadonlyArray<ToolCallPart> = []
    let finish: Finish | undefined
    // 收口当前步：把累积的响应封装成 LLMResponse 归档，并重置累积器
    const close = (reason: FinishReasonDetails, usage: Usage | undefined) => {
      if (step.events.length === 0) return
      const response = new LLMResponse({
        message: step.message,
        events: step.events,
        usage: usage ?? step.usage,
        finishReason: reason,
      })
      steps.push(response)
      assistant = messages.push(response.message) - 1
      // 记录本步非法 JSON 的调用，供随后到达的 tool-result 事件匹配回放
      invalid = step.events.filter(LLMEvent.is.toolInputError).map(invalidCall)
      step = ResponseFold.empty()
    }
    return Stream.runForEach(events, (event) =>
      Effect.sync(() => {
        // 整个循环的终止事件：收口当前步并记下 finish
        if (event.type === "finish") {
          close(event.reason, event.usage)
          finish = event
          return
        }
        // 步间隙的工具结果：由 loop 真正执行工具后发出，不属于模型输出流本身
        if (event.type === "tool-result" && betweenSteps) {
          const call = invalid.find((item) => item.id === event.id)
          const previous = messages[assistant]
          // 若对应的是非法输入调用，先把回放调用补进助手消息，保持 call/result 配对
          if (call && previous.role === "assistant") messages[assistant] = withInvalidCalls(previous, [call])
          messages.push(
            Message.tool({
              id: event.id,
              name: event.name,
              namespace: event.namespace,
              result: event.result,
              providerMetadata: event.providerMetadata,
            }),
          )
          return
        }
        // 新的一步开始，退出步间隙状态
        if (event.type === "step-start") betweenSteps = false
        step = ResponseFold.reduce(step, event)
        // 一步结束：收口并进入步间隙，等待可能的工具结果
        if (event.type !== "step-finish") return
        close(event.reason, event.usage)
        betweenSteps = true
      }),
    ).pipe(
      Effect.flatMap(() => {
        // 没有 finish 就说明流被截断或提供方输出异常，不能当作成功结果
        if (finish === undefined)
          return Effect.fail(
            new AIError({
              reason: new InvalidProviderOutputError({
                message: "The stream ended without a finish event.",
                classification: "incomplete-stream",
              }),
            }),
          )
        // 文本取最后一步；若 finish 带 object（结构化输出）也一并带上
        const result = {
          text: steps.at(-1)?.text ?? "",
          steps,
          messages,
          usage: finish.usage,
          finishReason: finish.reason,
          ...("object" in finish ? { object: finish.object } : {}),
        }
        return Effect.succeed(result)
      }),
    )
  })
}
