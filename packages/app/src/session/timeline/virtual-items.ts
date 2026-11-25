/**
 * 会话时间线 — VirtualItems。
 * 会话消息时间线的渲染中负责 VirtualItems 部分，提供该部分所需的实现与类型定义。
 */
export function filterVirtualIndexes(indexes: number[], count: number) {
  return indexes.filter((index) => index >= 0 && index < count)
}
