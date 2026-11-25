/**
 * 工具执行运行时（tool runtime）。
 *
 * 本模块位于“模型输出工具调用”与“真正执行工具”之间，负责三件事：
 *   1. dispatch：按名字找到工具、校验并执行一次调用，把成功/失败都包装成标准的 DispatchResult；
 *   2. runTools：把一步里的多个调用并发执行（concurrency: unbounded），结果仍按调用顺序返回；
 *   3. PendingCall：描述一个“待回应”的调用——带 error 时不执行，直接把错误回给模型重试。
 *
 * 设计要点：所有失败（找不到工具、无执行器、输入/输出校验失败、执行抛错）都被转成
 * “error 类型的工具结果”而不是让整个 Effect 失败，这样模型总能看到结果并自行纠正。
 */
import { Effect } from "effect"
import {
  LLMEvent,
  type ToolCallPart,
  ToolFailure,
  ToolOutput,
  ToolResultValue,
  type ToolOutput as ToolOutputType,
  type ToolResultValue as ToolResultValueType,
} from "./schema/index.js"
import { type Tool } from "./tool.js"

/**
 * 一次工具调用的“结算”结果。
 * result 是要回传给模型的标准化结果值；output 是工具自身声明的附加输出（可选）。
 */
export interface ToolSettlement {
  readonly result: ToolResultValueType
  readonly output?: ToolOutputType
}

/** dispatch 的完整结果：结算值 + 需要向外发出的一系列事件（如 tool-result）。 */
export interface DispatchResult extends ToolSettlement {
  readonly events: ReadonlyArray<LLMEvent>
}

/**
 * 执行一条规范化的工具调用（不负责模型 IO，也不负责循环 continuation）。
 *
 * 查找工具时，若调用带 namespace，则用 `namespace.name` 匹配（MCP 工具按命名空间隔离）。
 * 三种失败都被降级为 error 结果而非抛错：工具不存在、工具没有执行器、执行/校验抛 Tool.Error。
 * 这样循环总能拿到一个可回传的结果。
 */
export const dispatch = (tools: ReadonlyArray<Tool>, call: ToolCallPart): Effect.Effect<DispatchResult> => {
  // 命名空间化的工具名（例如 MCP 的 server.tool）
  const name = call.namespace === undefined ? call.name : `${call.namespace}.${call.name}`
  const tool = tools.find((item) => item.name === name)
  // 工具不存在：返回error结果并提示模型从可用列表里选
  if (!tool)
    return Effect.succeed(
      result(call, {
        type: "error",
        value: `No tool named "${name}" is currently available. Please use a tool from the available tool list.`,
      }),
    )
  // 工具只有定义没有执行器（例如只做展示的工具）
  if (!tool.execute)
    return Effect.succeed(result(call, { type: "error", value: `Tool has no execute handler: ${name}` }))

  return decodeAndExecute(tool, call).pipe(
    Effect.map((value) => result(call, value)),
    // 任何 Tool.Error 都转成 error 结果，把错误消息还给模型
    Effect.catchTag("Tool.Error", (failure) => Effect.succeed(result(call, { type: "error", value: failure.message }))),
  )
}

/**
 * 循环在下一步之前需要“回应”的一个调用。
 * 若带 error，则不真正执行工具，而是把这个错误作为结果回给模型（典型场景：输入非法 JSON）。
 */
export interface PendingCall {
  readonly call: ToolCallPart
  readonly error?: string
}

/**
 * 并发执行一步里的所有工具调用。
 *
 * concurrency: "unbounded" 表示不限制并发度——多个工具调用同时进行以加快响应；
 * 但 Effect.forEach 保证返回数组仍按输入 calls 的顺序排列，
 * 这点对 nextRequest 把结果按调用顺序回填消息至关重要。
 */
export const runTools = (tools: ReadonlyArray<Tool>, calls: ReadonlyArray<PendingCall>) =>
  Effect.forEach(
    calls,
    (item) =>
      // 带 error 的调用不执行，直接构造错误结果回给模型
      item.error === undefined
        ? dispatch(tools, item.call)
        : Effect.succeed(result(item.call, { type: "error", value: item.error })),
    { concurrency: "unbounded" },
  )

/**
 * 校验输入 → 执行工具 → 校验输出 → 投影结果的完整链路。
 *
 * 关键点：输入和输出都经过 schema 编解码（工具在注册时生成的 _decode / _encode），
 * 任何一侧校验失败都变成 ToolFailure，最终由 dispatch 转成 error 结果回给模型。
 * 这保证模型永远看到结构合法的结果，不会因为工具返回脏数据而破坏对话。
 */
const decodeAndExecute = (tool: Tool, call: ToolCallPart): Effect.Effect<ToolSettlement, ToolFailure> =>
  // 第一步：校验/解码模型传入的输入
  tool._decode(call.input).pipe(
    Effect.mapError((error) => new ToolFailure({ message: `Invalid tool input: ${error.message}` })),
    Effect.flatMap((decoded) =>
      // 第二步：执行工具本体，并把调用元信息（id/name/namespace）传给执行器
      tool.execute!(decoded, {
        id: call.id,
        name: call.name,
        namespace: call.namespace,
      }).pipe(
        // 第三步：校验/编码工具返回值
        Effect.flatMap((value) =>
          tool._encode(value).pipe(
            Effect.mapError(
              (error) =>
                new ToolFailure({
                  message: `Tool returned an invalid value for its success schema: ${error.message}`,
                }),
            ),
          ),
        ),
        // 第四步：把编码后的值投影成标准结果
        Effect.map((encoded) => {
          // 兼容旧式工具：直接返回 ToolResultValue 的形式
          if (tool._legacyResult && ToolResultValue.is(encoded))
            return { result: encoded, output: ToolOutput.fromResultValue(encoded) }
          // 新式工具：用 _project 把原始输出转成 ToolOutput，再提取可回传的结果值
          const output = tool._project(decoded, call.id, encoded)
          const result = ToolOutput.toResultValue(output)
          // 若投影结果是 error 类型，则不携带 output
          return result.type === "error" ? { result } : { result, output }
        }),
      ),
    ),
  )

/** 把结算值包装成 DispatchResult，并生成一个 tool-result 事件供外层广播。 */
const result = (call: ToolCallPart, value: ToolResultValueType | ToolSettlement): DispatchResult => {
  // 兼容两种入参：直接的 ToolResultValue，或完整的 ToolSettlement（含 output）
  const settlement = ToolResultValue.is(value) ? { result: value } : value
  return {
    result: settlement.result,
    output: settlement.output,
    events: [
      LLMEvent.toolResult({
        id: call.id,
        name: call.name,
        namespace: call.namespace,
        result: settlement.result,
        output: settlement.output,
        providerMetadata: call.providerMetadata,
      }),
    ],
  }
}

export const ToolRuntime = { dispatch } as const
