/**
 * 对等性应用场景：删除·CLI。
 *
 * 规格编号：C.4。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `api session.remove --param sessionID=...`: a DELETE answered with 204 prints nothing, exit 0.
import { defineCli } from "../../cli/run"
import { openapi } from "./fixture"

export default defineCli({
  args: ["api", "session.remove", "--param", "sessionID=ses_abcdef"],
  server: { routes: [openapi, { method: "DELETE", path: "/api/session/:id", status: 204 }] },
})
