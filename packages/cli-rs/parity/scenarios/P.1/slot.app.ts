/**
 * 对等性应用场景：slot·app。
 *
 * 规格编号：P.1。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// A plugin in a slot (P.1): a test plugin appends a line to home.footer, under the footer built-in. TS loads it
// from parity/plugins/slot as a local plugin; Rust registers its twin when OPENCODE_PARITY_PLUGIN is `slot`.
import { defineApp, HOME_PLACEHOLDER } from "../../lib/app"

export default defineApp({
  config: { plugins: ["./plugins/slot"] },
  env: { OPENCODE_PARITY_PLUGIN: "slot" },
  steps: [
    {
      checkpoint: "home",
      until: "slot plugin: home.footer",
      masks: [HOME_PLACEHOLDER],
    },
  ],
})
