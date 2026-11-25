/**
 * 对等性应用场景：文本·伪终端。
 *
 * 规格编号：C.p。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// Typing, line editing (Backspace, Left, Ctrl+A, Ctrl+K), and submit, between intro and outro.
import { definePty } from "../../pty/run"
import { demo, press } from "./demo"

export default definePty({
  args: [],
  command: demo("text"),
  cols: 60,
  rows: 16,
  steps: [
    { until: { screen: "Ada Lovelace" }, settle: 250, checkpoint: "placeholder" },
    press("Grace", "typed"),
    press("\x7f\x7fx", "backspace"),
    press("\x1b[D\x1b[Dz", "cursor in the middle"),
    press("\x01\x0bHopper", "ctrl-a ctrl-k"),
    press("\r", "submitted", "Done"),
  ],
  exits: true,
})
