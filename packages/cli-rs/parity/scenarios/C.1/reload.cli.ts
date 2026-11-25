/**
 * 对等性应用场景：重载·CLI。
 *
 * 规格编号：C.1。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `reload`: one POST without a location, then "Configuration reloaded". Only the fake server sees it.
import { defineCli } from "../../cli/run"

export default defineCli({
  args: ["reload"],
  server: { routes: [{ method: "POST", path: "/api/location/reload", status: 204 }] },
})
