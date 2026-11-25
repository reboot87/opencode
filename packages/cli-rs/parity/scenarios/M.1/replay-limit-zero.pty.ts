/**
 * 对等性应用场景：回放·限额·零·伪终端。
 *
 * 规格编号：M.1。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `--replay-limit 0` is rejected before anything is drawn.
import { definePty } from "../../pty/run"

export default definePty({
  args: ["mini", "--replay-limit", "0"],
  cols: 80,
  rows: 6,
  server: { routes: [] },
  steps: [{ until: { screen: "Error" }, settle: 300, checkpoint: "error" }],
  exits: true,
})
