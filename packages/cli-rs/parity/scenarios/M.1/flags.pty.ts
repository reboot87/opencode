/**
 * 对等性应用场景：开关·伪终端。
 *
 * 规格编号：M.1。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// Flag errors under a terminal: `--fork` without a session to fork.
import { definePty } from "../../pty/run"

export default definePty({
  args: ["mini", "--fork"],
  cols: 80,
  rows: 6,
  server: { routes: [] },
  steps: [{ until: { screen: "Error" }, settle: 300, checkpoint: "error" }],
  exits: true,
})
