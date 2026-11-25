/**
 * 管道示例：TUI。
 *
 * 管道示例：演示插件管道各阶段的串联方式。
 */
// Imports a deliberately unavailable package to check the loader diagnostic.
import { Plugin } from "@opencode/plugin/tui"
import { Option, Schema } from "effect"
import { appendFileSync } from "node:fs"

export default Plugin.define({
  id: "example.effectprobe",
  setup(context) {
    const decoded = Schema.decodeUnknownSync(Schema.Struct({ name: Schema.String }))({ name: "probe" })
    const log = (entry: unknown) => appendFileSync(String(context.options.log), JSON.stringify(entry) + "\n")
    log({ name: decoded.name, some: Option.getOrElse(Option.some(2), () => 0) })
  },
})
