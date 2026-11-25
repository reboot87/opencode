/**
 * 对等性应用场景：密码·伪终端。
 *
 * 规格编号：C.p。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// Masked input with the cursor moved left, a required error, then submit.
import { definePty } from "../../pty/run"
import { demo, press } from "./demo"

export default definePty({
  args: [],
  command: demo("password"),
  cols: 50,
  rows: 10,
  steps: [
    { until: { screen: "API key" }, settle: 250 },
    press("\r", "required", "Required"),
    press("s3cret", "typed"),
    press("\x1b[D\x1b[D", "cursor"),
    press("\r", "submitted", "value:"),
  ],
  exits: true,
})
