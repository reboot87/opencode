/**
 * 窗口管理 — Focus。
 * 浏览器窗口的创建与布局管理中负责 Focus 部分，提供该部分所需的实现与类型定义。
 */
import type { App, BrowserWindow } from "electron"

export type FocusableWindow = Pick<BrowserWindow, "isMinimized" | "restore" | "show" | "focus">

export function showWindow(win: Pick<FocusableWindow, "isMinimized" | "restore" | "show"> | null | undefined) {
  if (!win) return

  if (win.isMinimized()) win.restore()
  win.show()
}

export function focusWindow(
  win: Pick<FocusableWindow, "isMinimized" | "restore" | "focus"> | null | undefined,
  app: Pick<App, "focus">,
) {
  if (!win) return

  if (win.isMinimized()) win.restore()

  if (process.platform === "darwin") app.focus({ steal: true })
  win.focus()
}
