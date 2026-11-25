/**
 * 对等性应用场景：标题·long·伪终端。
 *
 * 规格编号：P.0b。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// A plugin's title longer than the 4091 bytes OpenTUI takes: the TUI sends it cut on a
// character boundary and keeps running, instead of failing its terminal session and exiting. Rust only.
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
    { keys: "/p0blong", until: { screen: "Set a long title" }, settle: 300 },
    { keys: "\r", until: { osc: "p0b long éé" }, settle: 300 },
    { keys: "still here", until: { screen: "still here" }, settle: 300 },
    { keys: "\x15", until: { gone: "still here" }, settle: 200 },
    ...leave,
  ],
  osc: ["title"],
  exits: true,
  rsOnly: true,
})
