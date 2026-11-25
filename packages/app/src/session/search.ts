/**
 * 会话界面 — Search。
 * 会话主界面的视图与状态中负责 Search 部分，提供该部分所需的实现与类型定义。
 */
export function looksLikeSessionID(value: string) {
  return value.length > 20 && value.startsWith("ses_")
}
