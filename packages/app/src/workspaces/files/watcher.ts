/**
 * 工作区文件 — Watcher。
 * 工作区内文件浏览界面中负责 Watcher 部分，提供该部分所需的实现与类型定义。
 */
import type { FileNode } from "@/runtime/server/types"
import type { OpenCodeEvent } from "@opencode/client/promise"

type WatcherEvent = Extract<OpenCodeEvent, { type: "filesystem.changed" }>

type WatcherOps = {
  normalize: (input: string) => string
  hasFile: (path: string) => boolean
  isOpen?: (path: string) => boolean
  loadFile: (path: string) => void
  node: (path: string) => FileNode | undefined
  isDirLoaded: (path: string) => boolean
  refreshDir: (path: string) => void
}

export function invalidateFromWatcher(event: WatcherEvent, ops: WatcherOps) {
  const path = ops.normalize(event.data.file)

  if (!path) return

  if (path.startsWith(".git/") || path.startsWith(".git\\")) return

  if (ops.hasFile(path) || ops.isOpen?.(path)) {
    ops.loadFile(path)
  }

  if (event.data.event === "change") {
    if (ops.node(path)?.type !== "directory") return

    if (!ops.isDirLoaded(path)) return
    ops.refreshDir(path)

    return
  }

  // Paths keep the native separator, so a Windows event names `src\sub\a.ts`.
  const parent = path.split(/[/\\]/).slice(0, -1).join("/")

  if (!ops.isDirLoaded(parent)) return

  ops.refreshDir(parent)
}
