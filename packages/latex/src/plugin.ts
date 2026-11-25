/**
 * GUI 插件 — Plugin。
 * GUI 插件的实现中负责 Plugin 部分，提供该部分所需的实现与类型定义。
 */
import { Plugin } from "@opencode/plugin/tui"
import { createLatexCodeBlockRenderer } from "./markdown"

export default Plugin.define({
  id: "opencode.latex",
  setup(context) {
    const render = createLatexCodeBlockRenderer(context.renderer, () => ({
      text: context.theme.text.base,
      subdued: context.theme.text.muted,
    }))
    context.markdown.registerCodeBlockRenderer("latex", render)
    context.markdown.registerCodeBlockRenderer("math", render)
  },
})
