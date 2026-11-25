/**
 * 对等性应用场景：status·已停止·CLI。
 *
 * 规格编号：C.8。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `service status` and `service stop` with nothing registered.
import { defineCli } from "../../cli/run"
import { env, script } from "./fixture"

export default defineCli({
  args: [],
  command: script([["service", "status"], ["service", "stop"], ["service", "status"]]),
  env,
})
