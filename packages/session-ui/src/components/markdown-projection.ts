/**
 * 通用组件 — MarkdownProjection。
 * 跨场景复用的通用 UI 组件中负责 MarkdownProjection 部分，提供该部分所需的实现与类型定义。
 */
import type { Block, Projection } from "./markdown-stream"

export function completedProjection(text: string): Projection {
  return { text, blocks: [{ raw: text, src: text, mode: "full" }] }
}

export function canReusePendingBlock(current: Pick<Block, "mode" | "raw"> | undefined, next: Block) {
  if (!current || current.mode !== next.mode) return false

  if (next.mode === "code" || next.mode === "live") return next.raw.startsWith(current.raw)

  return current.raw === next.raw
}
