/**
 * 对等性应用场景：选择·短·伪终端。
 *
 * 规格编号：C.p。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// A terminal shorter than the list limits the window to its rows minus four.
import { definePty } from "../../pty/run"
import { demo, press } from "./demo"

export default definePty({
  args: [],
  command: demo("select-long"),
  cols: 40,
  rows: 9,
  steps: [
    { until: { screen: "Pick one" }, settle: 250, checkpoint: "top" },
    press("kk", "end"),
    press("\x03", "cancelled", "Cancelled"),
  ],
  exits: true,
})
