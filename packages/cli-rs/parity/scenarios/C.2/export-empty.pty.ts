/**
 * 对等性应用场景：导出·空值·伪终端。
 *
 * 规格编号：C.2。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// The export picker with no sessions: "No sessions found", "Done", exit 0.
import { definePty } from "../../pty/run"
import { exportRoute, list, location } from "./fixture"

export default definePty({
  args: ["session", "export"],
  cols: 90,
  rows: 20,
  server: { routes: [location, list([]), exportRoute()] },
  steps: [{ until: { screen: "Done" }, settle: 300, checkpoint: "empty", timeout: 30_000 }],
  osc: [],
  exits: true,
  requests: true,
})
