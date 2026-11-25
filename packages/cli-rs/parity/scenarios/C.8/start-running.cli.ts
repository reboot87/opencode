/**
 * 对等性应用场景：启动·运行中·CLI。
 *
 * 规格编号：C.8。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `service start` with a ready service registered: it is reused, and its URL printed.
import { defineCli } from "../../cli/run"
import { env, info, only, register } from "./fixture"

export default defineCli({
  args: [],
  command: only(["service", "start"]),
  env,
  server: { version: false, routes: [info([])] },
  setup: register,
})
