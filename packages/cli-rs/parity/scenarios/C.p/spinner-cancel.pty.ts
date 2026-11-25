/**
 * 对等性应用场景：加载指示器·取消·伪终端。
 *
 * 规格编号：C.p。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// Ctrl+C while a spinner runs: Clack prints its cancel message as a success line and exits with 0.
import { definePty } from "../../pty/run"
import { demo } from "./demo"

export default definePty({
  args: [],
  command: demo("spinner-wait"),
  cols: 50,
  rows: 8,
  steps: [
    { until: { screen: "Waiting" } },
    { keys: "\x03", until: { screen: "Canceled" }, settle: 300, checkpoint: "cancelled" },
  ],
  exits: true,
})
