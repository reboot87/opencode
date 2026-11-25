/**
 * Cerebras provider 插件。
 * 注册 Cerebras provider（依赖其 npm 包）。
 */
import { Effect } from "effect"
import { define } from "@opencode/plugin/effect/plugin"

export const CerebrasPlugin = define({
  id: "opencode.provider.cerebras",
  effect: Effect.fn(function* (ctx) {
    yield* ctx.provider.transform((evt) => {
      for (const item of evt.list()) {
        if (item.provider.package !== "@opencode/ai/providers/cerebras") continue
        evt.update(item.provider.id, (provider) => {
          provider.headers = { ...provider.headers, "X-Cerebras-3rd-Party-Integration": "opencode" }
        })
      }
    })
  }),
})
