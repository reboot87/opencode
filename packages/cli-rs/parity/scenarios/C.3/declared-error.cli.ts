/**
 * 对等性应用场景：declared·错误·CLI。
 *
 * 规格编号：C.3。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// A declared 400 from the stats endpoint: the bare message, exit 1.
import { defineCli } from "../../cli/run"
import { statsRoute } from "./fixture"

export default defineCli({
  args: ["stats", "--year", "2020"],
  env: { TZ: "UTC" },
  server: {
    routes: [statsRoute({ _tag: "InvalidRequestError", message: "Stats range must end after it starts" }, 400)],
  },
})
