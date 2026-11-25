/**
 * 对等性应用场景：前台·两次·伪终端。
 *
 * 规格编号：P.0b。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// Two programs asked for in one call: the terminal goes to the first, and the second is
// refused at once with its own reply, instead of replacing the first unseen. Rust only.
import { definePty } from "../../pty/run"
import { home, install, leave } from "./fixture"

export default definePty({
  args: [],
  cols: 100,
  rows: 30,
  server: { fallback: "tui" },
  setup: (root) => install(root),
  steps: [
    ...home,
    { keys: "/p0btwice echo ready-$((1+1)); sleep 1", settle: 300 },
    { keys: "\r", until: { screen: "ready-2" }, timeout: 15_000 },
    // The sample sets each reply as the title too, so the title log has both.
    { until: { osc: "p0b error another program is in the foreground" } },
    { until: { osc: 'p0b exit {"code":0}' }, settle: 300 },
    ...leave,
  ],
  osc: ["title"],
  exits: true,
  rsOnly: true,
})
