/**
 * 插件对等性场景：TUI。
 *
 * 插件能力的对等性场景：验证 Rust 与 TypeScript 插件行为一致。
 */
// The distractor of the views machine (parity/machines/plugins.json): a second plugin beside life whose setup throws,
// with its own cause, under the option fail. Its opencode-native twin is init.luau beside it.
import type { Context } from "../../../../plugin/src/tui/plugin"

export default {
  id: "parity.other",
  setup(context: Context) {
    if (context.options?.fail) throw new Error("other setup fails as it loads")
  },
}
