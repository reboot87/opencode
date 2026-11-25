/**
 * 工具调用历史的规范化（normalizeToolHistory）。
 *
 * 不同 provider 对工具调用/结果的消息表达不完全一致：
 * 有的把工具结果放在独立消息里，有的合并，有的缺失。
 * 本模块把消息历史规范化成一致的形态：确保每个 tool call 都有对应的结果，
 * 缺失或空结果用占位文本（"(no tool output)" / "Tool result missing"）补齐，
 * 避免模型看到悬空的调用。
 */
import { type Message, ToolMessage, ToolResultPart, type ToolCallPart } from "./schema/messages.js"

const EMPTY_TOOL_OUTPUT = "(no tool output)"
const MISSING_TOOL_RESULT = "Tool result missing"

export function normalizeToolHistory(messages: ReadonlyArray<Message>) {
  const normalized: Message[] = []
  const pending = new Map<string, ToolCallPart>()
  // System updates cannot sit between a tool call and its results, so they wait until every pending call is answered.
  const held: Message[] = []
  const releaseHeld = () => {
    if (pending.size > 0) return
    normalized.push(...held)
    held.length = 0
  }
  const appendMissingResults = () => {
    if (pending.size > 0) normalized.push(missingToolResults(pending.values()))
    pending.clear()
    releaseHeld()
  }

  for (const message of messages) {
    if (message.role === "user" || message.role === "assistant") appendMissingResults()

    if (message.role === "tool") {
      const tool = normalizeToolMessage(message, pending)
      if (tool) normalized.push(tool)
      releaseHeld()
      continue
    }

    if (message.role === "system" && pending.size > 0) {
      held.push(message)
      continue
    }

    normalized.push(message)
    if (message.role !== "assistant") continue
    for (const part of message.content) {
      if (part.type === "tool-call" && part.providerExecuted !== true) pending.set(part.id, part)
    }
  }
  appendMissingResults()

  return normalized.length === messages.length && normalized.every((message, index) => message === messages[index])
    ? messages
    : normalized
}

function missingToolResults(calls: Iterable<ToolCallPart>) {
  return new ToolMessage({
    role: "tool",
    content: [...calls].map((call) =>
      ToolResultPart.make({
        id: call.id,
        name: call.name,
        namespace: call.namespace,
        result: MISSING_TOOL_RESULT,
        resultType: "error",
      }),
    ),
  })
}

function normalizeToolMessage(message: ToolMessage, pending: Map<string, ToolCallPart>): Message | undefined {
  const content = message.content.map((part) => {
    if (part.type !== "tool-result" || part.providerExecuted === true) return part
    const call = pending.get(part.id)
    if (call) pending.delete(part.id)
    return normalizeToolResult(part, call)
  })
  if (content.length === 0) return undefined
  if (content.every((part, index) => part === message.content[index])) return message
  return new ToolMessage({ ...message, content })
}

function normalizeToolResult(part: ToolResultPart, call: ToolCallPart | undefined): ToolResultPart {
  const named =
    call === undefined || (part.name === call.name && part.namespace === call.namespace)
      ? part
      : { ...part, name: call.name, namespace: call.namespace }
  if (named.result.type === "text" && named.result.value === "")
    return { ...named, result: { type: "text", value: EMPTY_TOOL_OUTPUT } }
  if (named.result.type === "error" && named.result.value === "")
    return { ...named, result: { type: "error", value: EMPTY_TOOL_OUTPUT } }
  if (named.result.type !== "content") return named
  const value = named.result.value.filter((item) => item.type !== "text" || item.text !== "")
  if (value.length === 0) return { ...named, result: { type: "text", value: EMPTY_TOOL_OUTPUT } }
  if (value.length === named.result.value.length) return named
  return { ...named, result: { type: "content", value } }
}
