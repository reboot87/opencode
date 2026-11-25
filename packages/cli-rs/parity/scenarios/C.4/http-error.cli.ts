/**
 * 对等性应用场景：HTTP·错误·CLI。
 *
 * 规格编号：C.4。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `api get /api/missing`: the error body on stdout, `HTTP 404 Not Found` on stderr, exit 1.
import { defineCli } from "../../cli/run"

export default defineCli({
  args: ["api", "get", "/api/missing"],
  server: { routes: [] },
})
