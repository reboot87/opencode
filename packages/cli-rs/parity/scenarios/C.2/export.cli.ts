/**
 * 对等性应用场景：导出·CLI。
 *
 * 规格编号：C.2。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `session export <id> --sanitize`: the transfer data, pretty-printed.
import { defineCli } from "../../cli/run"
import { exportRoute } from "./fixture"

export default defineCli({
  args: ["session", "export", "ses_aaaaaaaa0001", "--sanitize"],
  server: { routes: [exportRoute()] },
})
