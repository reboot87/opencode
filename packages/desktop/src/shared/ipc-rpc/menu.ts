/**
 * IPC RPC — Menu。
 * 基于 IPC 的远程调用协议定义中负责 Menu 部分，提供该部分所需的实现与类型定义。
 */
import { Schema } from "effect"
import { Rpc, RpcGroup } from "effect/rpc"

const DesktopMenuAction = Schema.Literals([
  "app.installCli",
  "app.relaunch",
  "edit.undo",
  "edit.redo",
  "edit.cut",
  "edit.copy",
  "edit.paste",
  "edit.delete",
  "edit.selectAll",
  "view.reload",
  "view.toggleDevTools",
  "view.resetZoom",
  "view.zoomIn",
  "view.zoomOut",
  "view.toggleFullscreen",
  "window.new",
  "window.close",
  "window.minimize",
  "window.toggleMaximize",
])

export const MenuRunAction = Rpc.make("MenuRunAction", {
  payload: { action: DesktopMenuAction },
})

export const MenuRpcs = RpcGroup.make(MenuRunAction)
