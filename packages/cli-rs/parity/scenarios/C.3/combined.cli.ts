/**
 * 对等性应用场景：combined·CLI。
 *
 * 规格编号：C.3。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `stats --days 3 --all`: rejected before any request, with the bare message and exit 1.
import { defineCli } from "../../cli/run"

export default defineCli({
  args: ["stats", "--days", "3", "--all"],
  server: { routes: [] },
})
