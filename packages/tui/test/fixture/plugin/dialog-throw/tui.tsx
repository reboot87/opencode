/**
 * 插件夹具（dialog-throw） — Tui。
 * 模拟插件抛出对话框错误的夹具中负责 Tui 部分，提供该部分所需的实现与类型定义。
 */
import { Plugin } from "@opencode/plugin/tui"

// A dialog that throws while rendering (anomalyco/opencode#61101).
export default Plugin.define({
  id: "fixture.dialog-throw",
  setup(context) {
    context.ui.dialog.show(() => {
      throw new Error("dialog exploded")
    })
  },
})
