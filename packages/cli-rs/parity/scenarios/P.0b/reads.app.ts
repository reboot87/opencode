/**
 * 对等性应用场景：reads·app。
 *
 * 规格编号：P.0b。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// The small reads of ABI 1.6 (P0b): the test plugin's line in the `app` slot shows its own width, the session tabs,
// the palette's keys, the model's variants and the pending keys, as each client answers them. TS loads the plugin from
// parity/plugins/p0b as a local plugin; Rust registers its twin when OPENCODE_PARITY_PLUGIN is `p0b`.
import { defineApp, HOME_PLACEHOLDER } from "../../lib/app"

export default defineApp({
  config: { plugins: ["./plugins/p0b"] },
  env: { OPENCODE_PARITY_PLUGIN: "p0b" },
  steps: [
    {
      checkpoint: "home",
      until: "pending 0",
      masks: [HOME_PLACEHOLDER],
    },
  ],
})
