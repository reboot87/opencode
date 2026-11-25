/**
 * 对等性应用场景：选择·伪终端。
 *
 * 规格编号：C.p。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// The initial value, hints on the focused option, wrap-around with arrows and J and K.
import { definePty } from "../../pty/run"
import { demo, press } from "./demo"

export default definePty({
  args: [],
  command: demo("select"),
  cols: 60,
  rows: 14,
  steps: [
    { until: { screen: "Provider" }, settle: 250, checkpoint: "initial" },
    press("\x1b[B", "down"),
    press("jj", "wrapped"),
    press("\x1b[A", "up"),
    press("\r", "submitted", "value:"),
  ],
  exits: true,
})
