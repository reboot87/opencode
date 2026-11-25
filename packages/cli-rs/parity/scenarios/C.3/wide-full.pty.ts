/**
 * 对等性应用场景：宽·完整·伪终端。
 *
 * 规格编号：C.3。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `stats --year 2020 --full` on a 120-column terminal with NO_COLOR: the table layouts of the detail sections.
import { definePty } from "../../pty/run"
import { statsRoute, year2020 } from "./fixture"

export default definePty({
  args: ["stats", "--year", "2020", "--full"],
  cols: 120,
  rows: 40,
  env: { TZ: "UTC", NO_COLOR: "1", COLORFGBG: "0;15" },
  server: { routes: [statsRoute(year2020)] },
  steps: [{ until: { screen: "unfinished" }, settle: 300, checkpoint: "details", timeout: 30_000 }],
  osc: [],
  exits: true,
  requests: true,
})
