/**
 * 对等性应用场景：模型·成本·CLI。
 *
 * 规格编号：C.3。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `stats --year 2020 --project <id> --models --cost --limit 1`: a selected project, no tool data asked
// for (`tools=none`), and a "+1 more model" line.
import { defineCli } from "../../cli/run"
import { stats, statsRoute } from "./fixture"

export default defineCli({
  args: ["stats", "--year", "2020", "--project", "proj_selected", "--models", "--cost", "--limit", "1"],
  env: { TZ: "UTC" },
  server: { routes: [statsRoute(stats(Date.UTC(2020, 0, 1), Date.UTC(2021, 0, 1), "none"))] },
})
