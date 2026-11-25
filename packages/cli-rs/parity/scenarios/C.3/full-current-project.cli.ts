/**
 * 对等性应用场景：完整·current·project·CLI。
 *
 * 规格编号：C.3。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `stats --year 2020 --project . --full`: the project of the working directory, then every detail
// section (cost, models, tools) without the card.
import { defineCli } from "../../cli/run"
import { location, statsRoute, year2020 } from "./fixture"

export default defineCli({
  args: ["stats", "--year", "2020", "--project", ".", "--full"],
  env: { TZ: "UTC" },
  server: { routes: [location, statsRoute(year2020)] },
})
