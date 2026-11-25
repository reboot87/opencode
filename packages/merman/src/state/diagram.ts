/**
 * 模块 — Diagram。
 * 该目录下的功能模块中负责 Diagram 部分，提供该部分所需的实现与类型定义。
 */
import { drawStateDiagramGrid } from "./drawing.js"
import { parseMermaidStateDiagram } from "./parser.js"
import { renderStateGridText } from "./render-grid.js"
import type { StateDiagramRenderOptions } from "./types.js"

export function renderStateDiagram(content: string, options: StateDiagramRenderOptions = {}): string {
  return renderStateGridText(drawStateDiagramGrid(parseMermaidStateDiagram(content), options))
}
