/**
 * 对等性应用场景：会话·new·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `-s ses_named` that the server does not know: the session is created with that ID.
import { defineCli } from "../../cli/run"
import { server, textStep } from "./fixture"

export default defineCli({
  args: ["run", "-s", "ses_named", "hi"],
  server: server({
    sessionID: "ses_named",
    events: () => textStep("ok"),
    routes: [{ path: "/api/session/ses_named", status: 404, json: { _tag: "SessionNotFoundError", message: "nope" } }],
  }),
})
