/**
 * 会话界面 — MessageIdFromHash。
 * 会话主界面的视图与状态中负责 MessageIdFromHash 部分，提供该部分所需的实现与类型定义。
 */
export const messageIdFromHash = (hash: string) => {
  const value = hash.startsWith("#") ? hash.slice(1) : hash
  const match = value.match(/^message-(.+)$/)

  if (!match) return

  return match[1]
}
