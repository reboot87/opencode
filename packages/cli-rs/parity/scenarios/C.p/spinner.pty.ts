/**
 * 对等性应用场景：加载指示器·伪终端。
 *
 * 规格编号：C.p。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// The spinner's final lines: success and cancel codes, between intro and outro.
import { definePty } from "../../pty/run"
import { demo } from "./demo"

export default definePty({
  args: [],
  command: demo("spinner"),
  cols: 50,
  rows: 12,
  steps: [{ until: { screen: "Done" }, settle: 300, checkpoint: "done" }],
  exits: true,
})
