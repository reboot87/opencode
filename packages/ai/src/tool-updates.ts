/**
 * 工具状态更新（tool updates）的归一化与协议能力适配。
 *
 * 背景：请求的顶层 tools 只是“开头放一条 Message.tools({ add: tools })”的简写。
 * 工具状态本质上是一个有序的声明列表：开头那条 + 按消息顺序出现的各个标记。
 * 把整个列表折叠（fold）起来，就能在不支持原地变更的协议里表达工具变化；
 * 而支持原地变更的协议可以保留标记位置，让开头的声明及其后面的提示词缓存保持稳定。
 *
 * ToolUpdateEncoding 描述某个协议能以何种方式原地发送工具变更。
 */
import { Message, SystemMessage, type LLMRequest, type ToolChanges, type ToolEntry } from "./schema/messages.js"
import type { Capabilities } from "./schema/options.js"
import { flattenTools } from "./protocols/shared.js"

export type ToolUpdate = NonNullable<NonNullable<Capabilities["tools"]>["updates"]>[number]

/** 协议能原地替代 Message.tools(...) 标记的方式；模型的 tools.updates 能力会进一步收窄它。 */
export interface ToolUpdateEncoding {
  readonly kinds: ReadonlyArray<ToolUpdate>
  /** 该消息下标处的标记能否原地发送，默认任意位置都可以。 */
  readonly placeable?: (request: LLMRequest, index: number) => boolean
  /** 某个工具能否原地增删，默认所有工具都可以。 */
  readonly declarable?: (tool: ToolEntry) => boolean
}

export const toolsUpdate = (message: Message): ToolChanges | undefined =>
  message.role === "system" ? message.tools : undefined

/** Whether any marker adds a tool, so a request without top-level tools still declares some. */
export const addsTools = (request: LLMRequest) =>
  request.messages.some((message) => (toolsUpdate(message)?.add.length ?? 0) > 0)

/** The changes this route sends in place: the model's `tools.updates` that the protocol's encoding covers. */
export const toolUpdateKinds = (request: LLMRequest) => {
  const encoding = request.model.route.toolUpdates
  return (request.model.capabilities?.tools?.updates ?? []).filter((kind) => encoding?.kinds.includes(kind))
}

/** Apply one change: removals first, then additions replace a same-named tool in place or append. */
export const foldTools = <Item extends { readonly name: string }>(
  tools: ReadonlyArray<Item>,
  add: ReadonlyArray<Item>,
  remove: ReadonlyArray<string>,
): ReadonlyArray<Item> => {
  const added = new Map(add.map((tool) => [tool.name, tool]))
  const kept = tools.filter((tool) => !remove.includes(tool.name)).map((tool) => added.get(tool.name) ?? tool)
  const names = new Set(kept.map((tool) => tool.name))
  return [...kept, ...[...added.values()].filter((tool) => !names.has(tool.name))]
}

/**
 * Fold the declarations up to the last one this route can't send in place into the leading one (the request's
 * `tools`), and keep later markers in place, trimmed to their effective changes. Protocols send kept markers in
 * message order and track what they need along the way. A marker is sent in place only after the conversation starts, when the model's
 * `tools.updates` and the protocol's encoding both cover what it does: `add` a new name, `replace` a name declared
 * before (even if removed since), `remove` a current tool. Removing a name that matches no current tool does nothing.
 */
export const planToolUpdates = (request: LLMRequest): LLMRequest => plan(request, toolUpdateKinds(request))

/** Fold every marker into the top-level tools, as a route without in-place tool changes sends them. */
export const foldToolUpdates = (request: LLMRequest): LLMRequest => plan(request, [])

const plan = (request: LLMRequest, supported: ReadonlyArray<ToolUpdate>): LLMRequest => {
  const changes = request.messages.flatMap((message, index) =>
    message.role === "system" && message.tools !== undefined ? [{ index, ...message.tools }] : [],
  )
  if (changes.length === 0) return request
  const encoding = request.model.route.toolUpdates
  const declarable = (tool: ToolEntry) => encoding?.declarable?.(tool) ?? true
  const firstTurn = request.messages.findIndex((message) => message.role !== "system")
  const steps = changes.reduce<{
    readonly tools: ReadonlyArray<ToolEntry>
    readonly declared: ReadonlySet<string>
    readonly steps: ReadonlyArray<PlanStep>
  }>(
    (state, change) => {
      const added = change.add.map((tool) => tool.name)
      const removed = state.tools.filter((tool) => change.remove.includes(tool.name) && !added.includes(tool.name))
      const tools = foldTools(state.tools, change.add, change.remove)
      const kinds = [
        ...(removed.length > 0 || withdrawnTools(state.tools, tools).length > 0 ? ["remove" as const] : []),
        ...added.map((name) => (state.declared.has(name) ? ("replace" as const) : ("add" as const))),
      ]
      const native =
        firstTurn !== -1 &&
        change.index > firstTurn &&
        kinds.every((kind) => supported.includes(kind)) &&
        [...change.add, ...removed].every(declarable) &&
        (encoding?.placeable?.(request, change.index) ?? true)
      const step = {
        index: change.index,
        native,
        tools,
        changes: { add: change.add, remove: removed.map((tool) => tool.name) },
      }
      return { tools, declared: new Set([...state.declared, ...added]), steps: [...state.steps, step] }
    },
    { tools: request.tools, declared: new Set(request.tools.map((tool) => tool.name)), steps: [] },
  ).steps
  const cut = steps.findLastIndex((step) => !step.native)
  const kept = new Map(steps.slice(cut + 1).map((step) => [step.index, step.changes]))
  return {
    ...request,
    tools: cut === -1 ? request.tools : steps[cut]!.tools,
    messages: request.messages.flatMap((message, index) => {
      if (message.role !== "system" || message.tools === undefined) return [message]
      const tools = kept.get(index)
      if (tools !== undefined && (tools.add.length > 0 || tools.remove.length > 0))
        return [new SystemMessage({ ...message, tools })]
      if (message.content.length === 0) return []
      return [new SystemMessage({ id: message.id, role: "system", content: message.content })]
    }),
  }
}

interface PlanStep {
  readonly index: number
  readonly native: boolean
  readonly tools: ReadonlyArray<ToolEntry>
  readonly changes: ToolChanges
}

/** Flattened names of the tools in `before` that `after` no longer has, including tools a redefined namespace drops. */
export const withdrawnTools = (before: ReadonlyArray<ToolEntry>, after: ReadonlyArray<ToolEntry>) => {
  const kept = new Set(toolNames(after))
  return toolNames(before).filter((name) => !kept.has(name))
}

const toolNames = (tools: ReadonlyArray<ToolEntry>) => flattenTools(tools).map((tool) => tool.name)

/** Rewrite the tools each marker adds, keeping the request identity when there are no markers. */
export const mapToolUpdates = (
  request: LLMRequest,
  f: (tools: ReadonlyArray<ToolEntry>) => ReadonlyArray<ToolEntry>,
): LLMRequest => {
  if (!request.messages.some((message) => toolsUpdate(message) !== undefined)) return request
  return {
    ...request,
    messages: request.messages.map((message) =>
      message.role === "system" && message.tools !== undefined
        ? new SystemMessage({ ...message, tools: { ...message.tools, add: f(message.tools.add) } })
        : message,
    ),
  }
}
