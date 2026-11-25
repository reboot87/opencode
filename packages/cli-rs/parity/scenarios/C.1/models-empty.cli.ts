/**
 * 对等性应用场景：模型·空值·CLI。
 *
 * 规格编号：C.1。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `models` with no models prints nothing, not an empty line.
import { defineCli } from "../../cli/run"

export default defineCli({
  args: ["models"],
  server: { routes: [{ path: "/api/model", json: { location: { directory: "/work" }, data: [] } }] },
})
