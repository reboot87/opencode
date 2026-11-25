/**
 * WSL 插件 — RowView。
 * Windows Subsystem for Linux 相关的 GUI 插件中负责 RowView 部分，提供该部分所需的实现与类型定义。
 */
import type { WslOpencodeCheck, WslServersState } from "./contract"

/** A configured distro's settings row, from main's state alone. A server still starting can be updated or removed. */
export function wslRowView(state: WslServersState | undefined, distro: string) {
  const job = state?.distroJobs[distro]
  const check = state?.opencodeChecks[distro]
  const action = opencodeAction(check)
  const runtime = state?.servers.find((item) => item.config.distro === distro)?.runtime.kind
  const free = !job || job === "starting"

  return {
    version: check?.version ?? null,
    button: action ? { label: job === "updating" ? "server.updating" : action, disabled: !free } : null,
    retry: !job && (runtime === "failed" || runtime === "stopped"),
    removable: free,
  }
}

function opencodeAction(check: WslOpencodeCheck | undefined) {
  if (!check) return

  if (!check.resolvedPath) return "onboarding.installOpencode"

  if (check.matchesDesktop === false) return "onboarding.updateOpencode"
}
