/**
 * 对等性应用场景：导出·取消·伪终端。
 *
 * 规格编号：C.2。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// Escape in the export picker: "Cancelled", exit 130, and no export request.
import { definePty } from "../../pty/run"
import { exportRoute, list, location, sessions } from "./fixture"

export default definePty({
  args: ["session", "export"],
  cols: 90,
  rows: 20,
  server: { routes: [location, list(sessions), exportRoute()] },
  steps: [
    { until: { screen: "Select session to export" }, settle: 300, timeout: 30_000 },
    { keys: "\x1b", until: { screen: "Cancelled" }, settle: 300, checkpoint: "cancelled" },
  ],
  osc: [],
  exits: true,
  requests: true,
})
