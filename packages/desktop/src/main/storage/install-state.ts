/**
 * 本地存储 — InstallState。
 * 桌面端配置的本地持久化中负责 InstallState 部分，提供该部分所需的实现与类型定义。
 */
export function hasExistingAppState(entries: Array<{ name: string; directory: boolean }>) {
  return entries.some((entry) => {
    if (entry.name === "opencode.settings") return true

    if (entry.name.endsWith(".dat")) return true

    if (entry.name === "drafts.sqlite") return true

    if (/^window-state-.+\.json$/.test(entry.name)) return true

    return entry.directory && entry.name === "opencode"
  })
}
