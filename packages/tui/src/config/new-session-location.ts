/**
 * 终端配置 — NewSessionLocation。
 * 终端界面的配置读取与默认值中负责 NewSessionLocation 部分，提供该部分所需的实现与类型定义。
 */
import type { LocationRef } from "@opencode/client/promise"

export function newSessionLocation(
  mode: "launch" | "inherit",
  launchDirectory: string,
  current?: LocationRef,
  unavailable?: LocationRef,
): LocationRef {
  if (
    mode === "inherit" &&
    current &&
    (current.directory !== unavailable?.directory || current.workspaceID !== unavailable.workspaceID)
  )
    return current
  return { directory: launchDirectory }
}
