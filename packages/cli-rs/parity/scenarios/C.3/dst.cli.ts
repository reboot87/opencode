/**
 * 对等性应用场景：dst·CLI。
 *
 * 规格编号：C.3。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `stats --year 2024` in America/New_York: local midnights on both ends, the zone name in the query, and a
// calendar whose days do not drift across the DST changes.
import { defineCli } from "../../cli/run"
import { stats, statsRoute } from "./fixture"

const from = new Date("2024-01-01T05:00:00Z").getTime()
const to = new Date("2025-01-01T05:00:00Z").getTime()

export default defineCli({
  args: ["stats", "--year", "2024"],
  env: { TZ: "America/New_York" },
  server: { routes: [statsRoute(stats(from, to, "summary"))] },
})
