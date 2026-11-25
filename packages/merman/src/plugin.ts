/**
 * GUI 插件 — Plugin。
 * GUI 插件的实现中负责 Plugin 部分，提供该部分所需的实现与类型定义。
 */
import { Plugin } from "@opencode/plugin/tui"
import { createMermaidCodeBlockRenderer } from "./markdown.js"
import { resolveOpenCodeDiagramPalette } from "./palette.js"

export default Plugin.define({
  id: "opencode.merman",
  setup(context) {
    context.markdown.registerCodeBlockRenderer(
      "mermaid",
      createMermaidCodeBlockRenderer(context.renderer, () => ({
        colors: resolveOpenCodeDiagramPalette(context.theme, context.themeMode),
      })),
    )
  },
})
