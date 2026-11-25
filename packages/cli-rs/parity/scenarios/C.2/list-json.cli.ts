/**
 * 对等性应用场景：列表·JSON·CLI。
 *
 * 规格编号：C.2。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `session list -n 2 --format json`: the summary fields, a missing title left out.
import { defineCli } from "../../cli/run"
import { list, location, sessions } from "./fixture"

export default defineCli({
  args: ["session", "list", "-n", "2", "--format", "json"],
  server: { routes: [location, list(sessions)] },
})
