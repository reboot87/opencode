/**
 * 终端插件支持 — Markdown。
 * 终端界面的插件加载与扩展点中负责 Markdown 部分，提供该部分所需的实现与类型定义。
 */
import { createMarkdownCodeBlockRenderer, type MarkdownCodeBlockRenderer } from "@opentui/core"
import { isShallowEqual } from "remeda"
import { createMemo } from "solid-js"

export function createMarkdownRenderer(
  sources: () => ReadonlyArray<Readonly<Record<string, MarkdownCodeBlockRenderer>>>,
) {
  // Changing renderBlock makes OpenTUI destroy and rebuild every Markdown block.
  // Only invalidate it when the effective last-wins language handlers change.
  const renderers = createMemo(
    () => Object.fromEntries(sources().flatMap((source) => Object.entries(source))),
    undefined,
    { equals: isShallowEqual },
  )
  return createMemo(() =>
    Object.keys(renderers()).length === 0 ? undefined : createMarkdownCodeBlockRenderer(renderers()),
  )
}
