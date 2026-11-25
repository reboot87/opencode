/**
 * 对等性应用场景：列表·错误·CLI。
 *
 * 规格编号：C.2。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// A declared error from the list: its bare message on stderr, exit 1.
import { defineCli } from "../../cli/run"
import { location } from "./fixture"

export default defineCli({
  args: ["session", "list"],
  server: {
    routes: [location, { path: "/api/session", status: 400, json: { _tag: "BadRequest", message: "Invalid cursor" } }],
  },
})
