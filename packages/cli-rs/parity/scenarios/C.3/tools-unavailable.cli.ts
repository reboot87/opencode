/**
 * 对等性应用场景：工具·不可用·CLI。
 *
 * 规格编号：C.3。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `stats --year 2020 --tools` against a server that sent no tool details: the section says so.
import { defineCli } from "../../cli/run"
import { stats, statsRoute } from "./fixture"

export default defineCli({
  args: ["stats", "--year", "2020", "--tools"],
  env: { TZ: "UTC" },
  server: { routes: [statsRoute(stats(Date.UTC(2020, 0, 1), Date.UTC(2021, 0, 1), "summary"))] },
})
