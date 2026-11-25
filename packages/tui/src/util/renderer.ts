/**
 * 终端工具 — Renderer。
 * 终端界面的通用工具函数中负责 Renderer 部分，提供该部分所需的实现与类型定义。
 */
import { RendererControlState, type CliRenderer } from "@opentui/core"

type TitleRenderer = Pick<CliRenderer, "isDestroyed" | "controlState" | "setTerminalTitle">

// OpenTUI rejects terminal control from suspend() until resume() completes, e.g. while $EDITOR runs.
export function setTerminalTitle(renderer: TitleRenderer, title: string) {
  if (renderer.isDestroyed || renderer.controlState === RendererControlState.EXPLICIT_SUSPENDED) return
  renderer.setTerminalTitle(title.replace(/[\u0000-\u001f\u007f-\u009f]+/g, " "))
}

export function destroyRenderer(renderer: TitleRenderer & Pick<CliRenderer, "destroy">) {
  if (renderer.isDestroyed) return
  setTerminalTitle(renderer, "")
  renderer.destroy()
}
