/**
 * 生命周期 — DeepLink。
 * 桌面端窗口与应用的启动退出流程中负责 DeepLink 部分，提供该部分所需的实现与类型定义。
 */
export function consoleReturnWindow(value: string) {
  try {
    const url = new URL(value)

    if (url.protocol !== "opencode:" || url.hostname !== "console" || url.pathname !== "/authorized") return
    const id = url.searchParams.get("window")

    if (!id || id.length > 256 || /[\u0000-\u001f\u007f]/.test(id)) return

    return id
  } catch {
    return
  }
}
