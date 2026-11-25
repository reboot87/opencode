/**
 * 推理强度（reasoning effort）更新的处理。
 *
 * 改变顶层的 reasoning effort 会让 provider 的提示词缓存失效。
 * 支持原生“逐消息更新”的协议会保持顶层 effort 不变，改用 Message.effort(...) 标记来降级表达；
 * 其它路由则直接去掉这些标记。
 */
import { type LLMRequest, type EffortPart, type Message } from "./schema/messages.js"

export const effortUpdate = (message: Message): EffortPart | undefined => {
  if (message.role !== "system" || message.content.length !== 1) return undefined
  const part = message.content[0]
  return part.type === "effort" ? part : undefined
}

export const stripEffortUpdates = (request: LLMRequest) => {
  const messages = request.messages.filter((message) => effortUpdate(message) === undefined)
  return messages.length === request.messages.length ? request : { ...request, messages }
}

export const applyEffortUpdates = (request: LLMRequest): LLMRequest =>
  request.model.route.supportsEffortUpdates?.(request) ? request : stripEffortUpdates(request)

// Reverted or forked history can leave the last marker disagreeing with the requested effort.
export const resolveEffortUpdates = (request: LLMRequest, current: string | undefined) => {
  const updates = request.messages.flatMap((message) => effortUpdate(message) ?? [])
  if (updates.length === 0) return { request, effort: current }
  if (updates.at(-1)?.effort !== current) return { request: stripEffortUpdates(request), effort: current }
  return { request, effort: updates[0]?.previous }
}
