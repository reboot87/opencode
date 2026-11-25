/**
 * 对等性应用场景：步骤·失败·JSON·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// As `step-failed`, in JSON.
import { defineCli } from "../../cli/run"
import { event, nowMask, server } from "./fixture"
import { failed } from "./step-failed.cli"

export default defineCli({
  args: ["run", "--format", "json", "hello"],
  server: server({
    events: () => failed,
    end: event("session.execution.failed", { error: { type: "provider", message: "rate limited" } }, 13),
  }),
  // The final error is stamped with `Date.now()`.
  masks: [nowMask],
})
