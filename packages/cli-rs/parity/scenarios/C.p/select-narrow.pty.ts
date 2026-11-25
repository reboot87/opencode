/**
 * 对等性应用场景：选择·窄·伪终端。
 *
 * 规格编号：C.p。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// A terminal narrower than the rows: frames wrap and redraw from the first changed line.
import { definePty } from "../../pty/run"
import { demo, press } from "./demo"

export default definePty({
  args: [],
  command: demo("select"),
  cols: 18,
  rows: 14,
  steps: [
    { until: { screen: "Provider" }, settle: 250, checkpoint: "initial" },
    press("\x1b[A", "up"),
    press("\x1b[A", "first"),
    press("\r", "submitted", "value:"),
  ],
  exits: true,
})
