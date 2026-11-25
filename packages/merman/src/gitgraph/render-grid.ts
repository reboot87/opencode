/**
 * 模块 — RenderGrid。
 * 该目录下的功能模块中负责 RenderGrid 部分，提供该部分所需的实现与类型定义。
 */
import type { StyledText } from "@opentui/core"
import type { DiagramCanvas } from "../core/canvas.js"
import { renderDiagramGridStyledText } from "../core/render-grid.js"
import type { GitGraphStyleColors } from "./style.js"
import type { GitGraphCellStyle } from "./types.js"

export type GitGraphGrid = DiagramCanvas<GitGraphCellStyle>

export function renderGitGraphGridText(grid: GitGraphGrid): string {
  return grid.toString({ trimBottom: true })
}

export function renderGitGraphGridStyledText(grid: GitGraphGrid, colors: GitGraphStyleColors): StyledText {
  return renderDiagramGridStyledText(grid, (run) => (run.style ? colors[run.style] : undefined), undefined, {
    trimBottom: true,
  })
}
