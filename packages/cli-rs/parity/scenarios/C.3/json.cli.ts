/**
 * 对等性应用场景：JSON·CLI。
 *
 * 规格编号：C.3。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `stats --year 2020 --json`: the server's statistics as they came, two-space indented, with tool details.
import { defineCli } from "../../cli/run"
import { statsRoute, year2020 } from "./fixture"

export default defineCli({
  args: ["stats", "--year", "2020", "--json"],
  env: { TZ: "UTC" },
  server: { routes: [statsRoute(year2020)] },
})
