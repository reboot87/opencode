/**
 * 对等性应用场景：删除·CLI。
 *
 * 规格编号：C.2。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `session delete <id>`: one DELETE, then the confirmation.
import { defineCli } from "../../cli/run"

export default defineCli({
  args: ["session", "delete", "ses_aaaaaaaa0001"],
  server: { routes: [{ method: "DELETE", path: "/api/session/:id", status: 204 }] },
})
