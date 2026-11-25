/**
 * 模块 — Options。
 * 该目录下的功能模块中负责 Options 部分，提供该部分所需的实现与类型定义。
 */
import type { BorderStyle } from "@opentui/core"
import type { FlowchartDirection } from "./types.js"

export interface FlowchartDiagramRenderOptions {
  compact?: boolean
  direction?: FlowchartDirection
  borderStyle?: BorderStyle
  minNodeGap?: number
  minRankGap?: number
  /** Target rendered width. Oversized horizontal layouts fold vertically and broad vertical ranks wrap. */
  layoutMaxWidth?: number
}
