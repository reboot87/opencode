/**
 * 对等性应用场景：app·主目录·app。
 *
 * 规格编号：P.1。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// The app slot (P.1) on home: the test plugin's line shows under the route, below the home footer. TS loads the
// plugin from parity/plugins/app as a local plugin; Rust registers its twin when OPENCODE_PARITY_PLUGIN is `app`.
import { defineApp, HOME_PLACEHOLDER } from "../../lib/app"

export default defineApp({
  config: { plugins: ["./plugins/app"] },
  env: { OPENCODE_PARITY_PLUGIN: "app" },
  steps: [
    {
      checkpoint: "home",
      until: "app plugin: app",
      masks: [HOME_PLACEHOLDER],
    },
  ],
})
