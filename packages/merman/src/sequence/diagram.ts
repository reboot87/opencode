/**
 * 模块 — Diagram。
 * 该目录下的功能模块中负责 Diagram 部分，提供该部分所需的实现与类型定义。
 */
import { drawSequenceDiagramGrid } from "./drawing.js"
import { parseMermaidSequenceDiagram } from "./parser.js"
import { renderSequenceGridText } from "./render-grid.js"
import type { SequenceDiagramRenderOptions } from "./types.js"

export function renderSequenceDiagram(content: string, options: SequenceDiagramRenderOptions = {}): string {
  return renderSequenceGridText(drawSequenceDiagramGrid(parseMermaidSequenceDiagram(content), options))
}
