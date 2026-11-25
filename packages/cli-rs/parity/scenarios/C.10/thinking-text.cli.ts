/**
 * 对等性应用场景：思考·文本·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `run --thinking`: reasoning prints as a `Thinking:` line on stdout when it is a pipe.
import { defineCli } from "../../cli/run"
import { event, server, textStep } from "./fixture"

const reasoning = [
  event("session.reasoning.started", { assistantMessageID: "msg_a", ordinal: 0 }, 12),
  event("session.reasoning.ended", { assistantMessageID: "msg_a", ordinal: 0, text: "  Let me look.  " }, 12),
]

export default defineCli({
  args: ["run", "--thinking", "hello"],
  server: server({ events: () => textStep("Done.", reasoning) }),
})
