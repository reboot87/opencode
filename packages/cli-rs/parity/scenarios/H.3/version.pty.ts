/**
 * 对等性应用场景：版本·伪终端。
 *
 * 规格编号：H.3。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `--version` under a terminal: the same line on screen, no OSC sequences, exit 0.
import { definePty } from "../../pty/run"

export default definePty({
  args: ["--version"],
  cols: 40,
  rows: 4,
  steps: [{ until: { screen: "opencode v" }, checkpoint: "version" }],
  exits: true,
})
