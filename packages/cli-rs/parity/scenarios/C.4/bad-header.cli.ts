/**
 * 对等性应用场景：糟糕·请求头·CLI。
 *
 * 规格编号：C.4。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// A header without `name:` fails before the request. First stderr line only (C40-handler-errors).
import { defineCli } from "../../cli/run"

export default defineCli({
  args: ["api", "get", "/api/session", "-H", ":value"],
  server: { routes: [] },
  stderrLines: 1,
})
