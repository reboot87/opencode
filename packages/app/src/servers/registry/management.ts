/**
 * 服务端注册表 — Management。
 * 已知服务端的登记与状态中负责 Management 部分，提供该部分所需的实现与类型定义。
 */
import type { ServerConnection } from "@/runtime/server/registry"

export function replaceServerConnection(
  originalKey: ServerConnection.Key,
  next: ServerConnection.Http,
  operations: {
    removeTabs: (key: ServerConnection.Key) => void
    add: (server: ServerConnection.Http) => ServerConnection.Any | undefined
    remove: (key: ServerConnection.Key) => void
  },
) {
  operations.removeTabs(originalKey)
  const added = operations.add(next)

  if (!added) return
  operations.remove(originalKey)
}
