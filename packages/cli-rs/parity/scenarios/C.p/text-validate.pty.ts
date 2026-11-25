/**
 * 对等性应用场景：文本·校验·伪终端。
 *
 * 规格编号：C.p。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// An initial value, a validation error that clears on the next key, the default value for an empty
// answer, and a required field, cancelled with a lone Escape.
import { definePty } from "../../pty/run"
import { demo, press } from "./demo"

export default definePty({
  args: [],
  command: demo("text-validate"),
  cols: 60,
  rows: 16,
  steps: [
    { until: { screen: "Port" }, settle: 250, checkpoint: "initial" },
    press("x\r", "invalid", "Expected a number"),
    press("\x7f", "fixed"),
    press("\x15\r", "default", "Required"),
    press("\r", "required"),
    press("\x1b", "escape", "Cancelled"),
  ],
  exits: true,
})
