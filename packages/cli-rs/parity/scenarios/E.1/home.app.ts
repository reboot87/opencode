/**
 * 对等性应用场景：主目录·app。
 *
 * 规格编号：E.1。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// The home (T17): the logo with both words side by side, the prompt slot, and the version in the footer.
import { defineApp, HOME_PLACEHOLDER } from "../../lib/app"

export default defineApp({
  steps: [
    {
      checkpoint: "wide",
      until: "Ask anything",
      masks: [HOME_PLACEHOLDER],
    },
  ],
})
