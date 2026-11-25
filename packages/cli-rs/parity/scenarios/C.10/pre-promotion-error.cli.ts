/**
 * 对等性应用场景：前置·promotion·错误·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// The execution fails before the prompt is promoted: that error is reported instead.
import { defineCli } from "../../cli/run"
import { event, nowMask, server } from "./fixture"

export default defineCli({
  args: ["run", "--format", "json", "hello"],
  server: server({
    delivered: false,
    listed: false,
    end: event("session.execution.failed", { error: { type: "unknown", message: "no provider" } }, 7),
  }),
  masks: [nowMask],
})
