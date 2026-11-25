/**
 * 会话·消息的测试辅助模块。
 *
 * 被测模块：@opencode/core/lib/session-message
 *
 * 核心测试的公共辅助模块：内存数据库、会话夹具与事件收集工具。
 */
export * as Expected from "./session-message.js"

// Partial expected values, not input fixtures. Keep each assertion's matcher and fields explicit.
export const user = <Text>(text: Text) => ({ type: "user" as const, text })

export const text = <Text>(text: Text) => ({ type: "text" as const, text })

export const reasoning = <Text>(text: Text) => ({ type: "reasoning" as const, text })

export const assistant = <const Fields extends object, Content>(fields: Fields, content: Content) => ({
  ...fields,
  type: "assistant" as const,
  content,
})

export const completedTool = <Identity extends object, Fields extends object>(identity: Identity, fields: Fields) => ({
  ...identity,
  type: "tool" as const,
  state: { ...fields, status: "completed" as const },
})

export const failedTool = <Identity extends object, Fields extends object>(identity: Identity, fields: Fields) => ({
  ...identity,
  type: "tool" as const,
  state: { ...fields, status: "error" as const },
})
