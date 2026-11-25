/**
 * 对等性应用场景：消息·伪终端。
 *
 * 规格编号：C.p。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// intro, every log level, notes (one with a title longer than its body), outro, and cancel.
import { definePty } from "../../pty/run"
import { demo } from "./demo"

export default definePty({
  args: [],
  command: demo("messages"),
  cols: 60,
  rows: 40,
  steps: [{ until: { screen: "Cancelled" }, settle: 250, checkpoint: "messages" }],
  exits: true,
})
