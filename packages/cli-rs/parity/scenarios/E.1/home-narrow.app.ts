/**
 * 对等性应用场景：主目录·窄·app。
 *
 * 规格编号：E.1。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// The home below 44 columns (T17): the two words stacked, one column of side padding, and no footer.
import { defineApp } from "../../lib/app"

export default defineApp({
  width: 40,
  height: 24,
  steps: [
    {
      checkpoint: "narrow",
      until: "Ask",
      masks: [
        {
          x: 2,
          y: 16,
          width: 38,
          height: 1,
          reason: "the placeholder example: random in TS and Rust",
        },
      ],
    },
  ],
})
