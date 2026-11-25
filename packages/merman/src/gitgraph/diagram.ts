/**
 * 模块 — Diagram。
 * 该目录下的功能模块中负责 Diagram 部分，提供该部分所需的实现与类型定义。
 */
import { drawGitGraphDiagramGrid } from "./drawing.js"
import { parseMermaidGitGraphDiagram } from "./parser.js"
import { renderGitGraphGridText } from "./render-grid.js"
import type { GitGraphDiagramRenderOptions } from "./types.js"

export function renderGitGraphDiagram(content: string, options: GitGraphDiagramRenderOptions = {}): string {
  return renderGitGraphGridText(drawGitGraphDiagramGrid(parseMermaidGitGraphDiagram(content), options))
}
