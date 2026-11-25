/**
 * 对等性应用场景：前台·标题·伪终端。
 *
 * 规格编号：P.0b。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// The title after a program in the foreground: suspending the terminal clears it, and the
// TUI sends its last title again once it is back, also one a plugin set. Rust only.
import { definePty } from "../../pty/run"
import { home, install, leave, run } from "./fixture"

export default definePty({
  args: [],
  cols: 100,
  rows: 30,
  server: { fallback: "tui" },
  setup: (root) => install(root),
  steps: [
    ...home,
    { keys: "/p0btitle", until: { screen: "Set the title" }, settle: 300 },
    { keys: "\r", until: { osc: "p0b title" }, settle: 300 },
    ...run("printf '\\033]0;child title\\007'; sleep 1", 1),
    // The reply sets its own title after: the TUI's title came back before it.
    { until: { osc: "child title", oscCount: ["p0b title", 2] }, settle: 300 },
    ...leave,
  ],
  osc: ["title"],
  exits: true,
  rsOnly: true,
})
