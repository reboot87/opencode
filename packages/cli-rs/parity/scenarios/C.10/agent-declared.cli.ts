/**
 * 对等性应用场景：智能体·declared·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `run --agent nope`: the agent switch gets a declared error (400). stderr has its message without the
// tag, as `errorMessage` gives it.
import { defineCli } from "../../cli/run"
import { server } from "./fixture"

export default defineCli({
  args: ["run", "--agent", "nope", "hello"],
  server: server({
    routes: [
      {
        method: "POST",
        path: "/api/session/ses_run/agent",
        status: 400,
        json: { _tag: "InvalidRequestError", message: "Unknown agent: nope" },
      },
    ],
  }),
})
