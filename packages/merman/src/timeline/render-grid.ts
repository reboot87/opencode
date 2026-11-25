/**
 * 时间线 — RenderGrid。
 * 按时间顺序展示会话消息的视图中负责 RenderGrid 部分，提供该部分所需的实现与类型定义。
 */
import type { StyledText } from "@opentui/core"
import type { DiagramCanvas } from "../core/canvas.js"
import { renderDiagramGridStyledText } from "../core/render-grid.js"
import type { TimelineStyleColors } from "./style.js"
import type { TimelineCellStyle } from "./types.js"

export type TimelineGrid = DiagramCanvas<TimelineCellStyle>

export function renderTimelineGridText(grid: TimelineGrid): string {
  return grid.toString({ trimBottom: true })
}

export function renderTimelineGridStyledText(grid: TimelineGrid, colors: TimelineStyleColors): StyledText {
  return renderDiagramGridStyledText(grid, (run) => (run.style ? colors[run.style] : undefined), undefined, {
    trimBottom: true,
  })
}
