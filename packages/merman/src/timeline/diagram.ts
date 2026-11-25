/**
 * 时间线 — Diagram。
 * 按时间顺序展示会话消息的视图中负责 Diagram 部分，提供该部分所需的实现与类型定义。
 */
import { drawTimelineDiagramGrid } from "./drawing.js"
import { parseMermaidTimelineDiagram } from "./parser.js"
import { renderTimelineGridText } from "./render-grid.js"
import type { TimelineDiagramRenderOptions } from "./types.js"

export function renderTimelineDiagram(content: string, options: TimelineDiagramRenderOptions = {}): string {
  return renderTimelineGridText(drawTimelineDiagramGrid(parseMermaidTimelineDiagram(content), options))
}
