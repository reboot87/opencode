/**
 * greeting的测试辅助模块。
 *
 * 被测模块：@opencode/core/plugin/fixtures/greeting
 *
 * 覆盖插件加载、生命周期钩子与能力注册的行为。
 */
import { Plugin } from "@opencode/plugin"

export default Plugin.define({
  id: "greeting",
  async setup(ctx) {
    await ctx.command.transform((editor) =>
      editor.add({
        name: "greet",
        description: ctx.options.description,
        execute: async () => {},
      }),
    )
  },
})
