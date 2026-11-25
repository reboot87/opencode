/**
 * 对等性应用场景：删除·缺失·CLI。
 *
 * 规格编号：C.2。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// Deleting an unknown session: the declared error's message, exit 1.
import { defineCli } from "../../cli/run"

export default defineCli({
  args: ["session", "delete", "ses_zzzzzzzz9999"],
  server: {
    routes: [
      {
        method: "DELETE",
        path: "/api/session/:id",
        status: 404,
        json: { _tag: "SessionNotFoundError", message: "Session not found: ses_zzzzzzzz9999" },
      },
    ],
  },
})
