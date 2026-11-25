/**
 * 对等性应用场景：非预期·status·CLI。
 *
 * 规格编号：C.3。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// An undeclared 500 from the stats endpoint: the client error's message, exit 1.
import { defineCli } from "../../cli/run"
import { statsRoute } from "./fixture"

export default defineCli({
  args: ["stats", "--year", "2020"],
  env: { TZ: "UTC" },
  server: { routes: [statsRoute({ message: "boom" }, 500)] },
})
