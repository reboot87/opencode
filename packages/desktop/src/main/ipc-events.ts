/**
 * 桌面端主进程 — IpcEvents。
 * Electron 主进程的核心逻辑中负责 IpcEvents 部分，提供该部分所需的实现与类型定义。
 */
import type { WebContents } from "electron"
import type { DesktopEvent } from "../shared/ipc-rpc/events"

type Sink = (sender: WebContents, event: DesktopEvent) => boolean

// The IPC transport owns each window's event stream and registers itself here while its layer lives.
let sink: Sink | undefined

export function setIpcEventSink(next: Sink) {
  sink = next

  return () => {
    if (sink === next) sink = undefined
  }
}

/** Returns false when the renderer has no event stream to receive the event, now or once its document binds. */
export function emitIpcEvent(sender: WebContents, event: DesktopEvent) {
  return sink ? sink(sender, event) : false
}
