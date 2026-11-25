/**
 * 对等性应用场景：智能体·declared·JSON·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `run --format json --agent nope`: the agent switch gets a declared error (400). The JSON error event has
// its message without the tag, as `errorMessage` gives it.
import { defineCli } from "../../cli/run"
import { nowMask, server } from "./fixture"

export default defineCli({
  args: ["run", "--format", "json", "--agent", "nope", "hello"],
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
  masks: [nowMask],
})
