/**
 * 对等性应用场景：确认·转义·伪终端。
 *
 * 规格编号：C.p。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// Escape cancels; Clack's alias also flips the answer that the cancelled frame shows.
import { definePty } from "../../pty/run"
import { demo, press } from "./demo"

export default definePty({
  args: [],
  command: demo("confirm"),
  cols: 50,
  rows: 10,
  steps: [{ until: { screen: "Continue?" }, settle: 250 }, press("\x1b", "cancelled", "Cancelled")],
  exits: true,
})
