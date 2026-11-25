/**
 * 对等性应用场景：自动补全·伪终端。
 *
 * 规格编号：C.p。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// Typing filters with a match count, arrows navigate (and then typing shows dim), no matches, submit.
import { definePty } from "../../pty/run"
import { demo, press } from "./demo"

export default definePty({
  args: [],
  command: demo("autocomplete"),
  cols: 70,
  rows: 24,
  steps: [
    { until: { screen: "Search" }, settle: 250, checkpoint: "initial" },
    press("go", "filtered"),
    press("\x7f\x7fitem 1", "item 1"),
    press("\x1b[B\x1b[B", "navigated"),
    press("x", "typed while navigating"),
    press("\x7f\r", "submitted", "value:"),
  ],
  exits: true,
})
