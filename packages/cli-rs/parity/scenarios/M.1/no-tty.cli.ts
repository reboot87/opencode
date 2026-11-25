/**
 * 对等性应用场景：无·终端设备·CLI。
 *
 * 规格编号：M.1。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `mini` with stdout on a pipe fails before it connects.
import { defineCli } from "../../cli/run"

export default defineCli({
  args: ["mini"],
  server: { routes: [] },
})
