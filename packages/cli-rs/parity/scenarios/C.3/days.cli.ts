/**
 * 对等性应用场景：天·CLI。
 *
 * 规格编号：C.3。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `stats --days 7`: the label, and a range from local midnight six days ago to now. Both ends move with
// the clock, so they are masked; the Rust unit test `ranges_follow_stats_range` checks the values.
import { defineCli } from "../../cli/run"
import { statsRoute, year2020 } from "./fixture"

export default defineCli({
  args: ["stats", "--days", "7"],
  env: { TZ: "UTC" },
  masks: [
    // Local midnight six days ago.
    { pattern: /from=\d+/, replacement: "from=<masked>" },
    // The range ends at the current time.
    { pattern: /to=\d+/, replacement: "to=<masked>" },
  ],
  server: { routes: [statsRoute(year2020)] },
})
