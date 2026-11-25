/**
 * GUI 插件 — Index 出口。
 * 集中导出 GUI 插件 中 Index 相关的实现、组件与类型。
 */
import { Plugin } from "@opencode/plugin/effect"
import { Effect } from "effect"
import { BrowserConnection } from "./connection.js"
import { BrowserTools } from "./tools.js"

export default Plugin.define({
  id: "opencode.browser",
  effect: (ctx) =>
    Effect.gen(function* () {
      const connection = yield* BrowserConnection.make(ctx)
      yield* BrowserTools.register(ctx, connection)
    }),
})
