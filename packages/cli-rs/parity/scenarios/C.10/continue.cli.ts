/**
 * 对等性应用场景：续接·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `-c -m demo/other#high --agent plan --title kept --archived`: the latest session of the directory is
// resumed, so neither the title nor the archive flag is applied; the agent and model are switched.
import { defineCli } from "../../cli/run"
import { server, session, textStep } from "./fixture"

export default defineCli({
  args: ["run", "-c", "-m", "demo/other#high", "--agent", "plan", "--title", "kept", "--archived", "again"],
  server: server({
    sessionID: "ses_old",
    events: () => textStep("ok"),
    routes: [
      {
        path: "/api/session",
        json: {
          data: [
            session("ses_child", { location: { directory: "/tmp/run/sub" } }),
            session("ses_old", { agent: "build" }),
          ],
          cursor: {},
        },
      },
      { method: "POST", path: "/api/session/ses_old/agent", status: 204 },
      { method: "POST", path: "/api/session/ses_old/model", status: 204 },
    ],
  }),
})
