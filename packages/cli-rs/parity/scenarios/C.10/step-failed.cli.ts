/**
 * 对等性应用场景：步骤·失败·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// A failed step prints the error and exits 1.
import { defineCli } from "../../cli/run"
import { event, server } from "./fixture"

export const failed = [
  event(
    "session.step.started",
    { assistantMessageID: "msg_a", agent: "build", model: { id: "model", providerID: "demo" }, started: 11 },
    11,
  ),
  event(
    "session.step.failed",
    { assistantMessageID: "msg_a", error: { type: "provider", message: "Error: rate limited" } },
    12,
  ),
]

export default defineCli({
  args: ["run", "hello"],
  server: server({
    events: () => failed,
    end: event("session.execution.failed", { error: { type: "provider", message: "rate limited" } }, 13),
  }),
})
