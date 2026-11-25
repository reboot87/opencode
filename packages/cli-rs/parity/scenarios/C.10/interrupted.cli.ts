/**
 * 对等性应用场景：中断·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// An interruption the user did not ask for is an error.
import { defineCli } from "../../cli/run"
import { event, nowMask, server, textStep } from "./fixture"

export default defineCli({
  args: ["run", "--format", "json", "hello"],
  server: server({
    events: () => textStep("partial"),
    end: event("session.execution.interrupted", { reason: "shutdown" }, 30),
  }),
  // The final error is stamped with `Date.now()`.
  masks: [nowMask],
})
