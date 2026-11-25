/**
 * 模块 — RenderGrid。
 * 该目录下的功能模块中负责 RenderGrid 部分，提供该部分所需的实现与类型定义。
 */
import type { RGBA, StyledText } from "@opentui/core"
import type { DiagramCanvas } from "../core/canvas.js"
import { renderDiagramGridStyledTextByStyle } from "../core/render-grid.js"
import type { StateStyleColors } from "./style.js"
import type { StateCellStyle } from "./types.js"

export type StateGrid = DiagramCanvas<StateCellStyle>

export function renderStateGridText(grid: StateGrid): string {
  return grid.toString({ trimTop: true, trimBottom: true })
}

export function renderStateGridStyledText(
  grid: StateGrid,
  colors: StateStyleColors,
  backgrounds?: Partial<Record<StateCellStyle, RGBA>>,
): StyledText {
  return renderDiagramGridStyledTextByStyle(grid, colors, backgrounds, {
    trimTop: true,
    trimBottom: true,
  })
}
