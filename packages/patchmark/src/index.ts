/**
 * GUI 插件 — Index 出口。
 * 集中导出 GUI 插件 中 Index 相关的实现、组件与类型。
 */
export { renderBlockKindToHtml, renderBlocksToHtml, renderInlinesToHtml, escapeHtml } from "./html"
export { healStreamingInline, computeTailHeal, applyTailHeal, type TailHeal } from "./heal"
export { parseInlines, type InlineParseOptions, type ReferenceDef } from "./inline"
export { createMarkdownStream, PatchmarkStream, splitPendingMarker } from "./stream"
export type {
  BlockKind,
  BlockPatch,
  HeadingLevel,
  InlineNode,
  ListItemNode,
  MarkdownBlock,
  MathDelimiter,
  StreamFrame,
  StreamOptions,
  TableAlign,
} from "./types"
