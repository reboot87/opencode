/**
 * GUI 插件 — Detect。
 * GUI 插件的实现中负责 Detect 部分，提供该部分所需的实现与类型定义。
 */
import type { MermaidDiagramKind } from "./diagnostics.js"
import { isMermaidFlowchartDiagram } from "./flowchart/parser.js"
import { isMermaidGanttDiagram } from "./gantt/parser.js"
import { isMermaidGitGraphDiagram } from "./gitgraph/parser.js"
import { isMermaidSequenceDiagram } from "./sequence/parser.js"
import { isMermaidStateDiagram } from "./state/parser.js"
import { isMermaidTimelineDiagram } from "./timeline/parser.js"

export function detectMermaidDiagram(content: string): MermaidDiagramKind | undefined {
  if (isMermaidFlowchartDiagram(content)) return "flowchart"
  if (isMermaidGanttDiagram(content)) return "gantt"
  if (isMermaidGitGraphDiagram(content)) return "gitGraph"
  if (isMermaidSequenceDiagram(content)) return "sequence"
  if (isMermaidStateDiagram(content)) return "state"
  if (isMermaidTimelineDiagram(content)) return "timeline"
  return undefined
}
