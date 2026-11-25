/**
 * 预加载脚本 — Types。
 * 渲染进程与 Node 能力之间的桥接中负责 Types 部分，提供该部分所需的实现与类型定义。
 */
import type { StorageSnapshot, WindowSnapshot } from "../shared/ipc-transport"
import type { WindowBootstrap } from "../shared/window-bootstrap"

export type ElectronNative = {
  windowID: string
  bootstrap: WindowBootstrap
  storageSnapshot: Promise<StorageSnapshot>
  plugins: Promise<WindowSnapshot["plugins"]>
  getPathForFile(file: File): string
}
