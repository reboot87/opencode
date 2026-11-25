/**
 * Provider 连接 — Remote。
 * 连接 provider 的授权界面中负责 Remote 部分，提供该部分所需的实现与类型定义。
 */
import { ServerConnection, serverName } from "@/runtime/server/registry"

export function authServerName(server: ServerConnection.Any) {
  if (ServerConnection.builtin(server)) return undefined

  if (server.type === "http" && ["localhost", "127.0.0.1", "[::1]"].includes(new URL(server.http.url).hostname))
    return undefined

  return serverName(server)
}
