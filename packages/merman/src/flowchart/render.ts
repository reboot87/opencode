/**
 * 模块 — Render。
 * 该目录下的功能模块中负责 Render 部分，提供该部分所需的实现与类型定义。
 */
import { drawFlowchartDiagramGrid } from "./drawing.js"
import type { FlowchartDiagramRenderOptions } from "./options.js"
import { parseMermaidFlowchartDiagram } from "./parser.js"

export function renderFlowchartDiagram(content: string, options: FlowchartDiagramRenderOptions = {}): string {
  return drawFlowchartDiagramGrid(parseMermaidFlowchartDiagram(content), options).toString({
    trimTop: true,
    trimBottom: true,
  })
}
