/**
 * 插件夹具（native-resources） — Tui。
 * 模拟插件使用原生资源的夹具中负责 Tui 部分，提供该部分所需的实现与类型定义。
 */
import { Plugin } from "@opencode/plugin/tui"
import { SyntaxStyle, Yoga, type BoxRenderable } from "@opentui/core"
import { createSignal, onMount } from "solid-js"

// The plugin pattern that the CLI plugin docs show for OpenTUI resources and layout reads.
export default Plugin.define({
  id: "fixture.native-resources",
  setup(context) {
    const style = SyntaxStyle.fromStyles({ default: { fg: context.theme.text.base } }, context.renderer.nativeScene)
    context.ui.slot({
      append: "home.footer",
      render: () => {
        const [padding, setPadding] = createSignal<number>()
        let box: BoxRenderable | undefined
        onMount(() => setPadding(box?.getPadding(Yoga.Edge.Left).value))
        return (
          <box ref={box} paddingLeft={2}>
            <markdown content="Plugin markdown ready" syntaxStyle={style} />
            <text>Plugin padding {padding()}</text>
          </box>
        )
      },
    })
    return () => context.renderer.idle().then(() => style.destroy())
  },
})
