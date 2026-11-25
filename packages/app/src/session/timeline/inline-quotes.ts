/**
 * 会话时间线 — InlineQuotes。
 * 会话消息时间线的渲染中负责 InlineQuotes 部分，提供该部分所需的实现与类型定义。
 */
// Inline quotes in user messages ship to local and dev builds first; beta and prod keep the comment cards until the
// layout is tried in a release.
export const inlineQuotes =
  import.meta.env.DEV || ["local", "dev"].includes(import.meta.env.VITE_OPENCODE_CHANNEL ?? "")
