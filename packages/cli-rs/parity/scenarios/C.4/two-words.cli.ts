/**
 * 对等性应用场景：两·words·CLI。
 *
 * 规格编号：C.4。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// Two arguments that are not a method and a path. First stderr line only (C40-handler-errors).
import { defineCli } from "../../cli/run"

export default defineCli({
  args: ["api", "fetch", "/api/session"],
  server: { routes: [] },
  stderrLines: 1,
})
