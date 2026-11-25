/**
 * 对等性应用场景：自动补全·空值·伪终端。
 *
 * 规格编号：C.p。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// No match: Enter submits nothing (`undefined`); Escape on another run cancels.
import { definePty } from "../../pty/run"
import { demo, press } from "./demo"

export default definePty({
  args: [],
  command: demo("autocomplete"),
  cols: 60,
  rows: 20,
  steps: [
    { until: { screen: "Search" }, settle: 250 },
    press("zzz", "no matches", "No matches"),
    press("\r", "submitted", "value:"),
  ],
  exits: true,
})
