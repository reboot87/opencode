/**
 * 对等性应用场景：分叉·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `-s ses_old --fork --archived --format json`: the session is forked, and the fork archived.
import { defineCli } from "../../cli/run"
import { server, session, textStep } from "./fixture"

export default defineCli({
  args: ["run", "-s", "ses_old", "--fork", "--archived", "--format", "json", "again"],
  server: server({
    sessionID: "ses_fork",
    events: () => textStep("ok"),
    routes: [
      {
        path: "/api/session/ses_old",
        json: { data: session("ses_old", { agent: "build", model: { providerID: "demo", id: "model" } }) },
      },
      {
        method: "POST",
        path: "/api/session/ses_old/fork",
        json: { data: session("ses_fork", { agent: "build", model: { providerID: "demo", id: "model" } }) },
      },
      { method: "POST", path: "/api/session/ses_fork/agent", status: 204 },
      { method: "POST", path: "/api/session/ses_fork/model", status: 204 },
      { method: "PATCH", path: "/api/session/ses_fork", status: 204 },
    ],
  }),
})
