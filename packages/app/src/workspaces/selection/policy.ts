/**
 * 工作区选择 — Policy。
 * 工作区切换与选择中负责 Policy 部分，提供该部分所需的实现与类型定义。
 */
import { ServerConnection } from "@/runtime/server/registry"
import type { Platform } from "@/runtime/platform/platform"

export function directoryPickerKind(platform: Platform["platform"], server: ServerConnection.Any, ownUrl?: string) {
  if (platform === "desktop" && ServerConnection.local(server, ownUrl)) return "native" as const

  return "server" as const
}
