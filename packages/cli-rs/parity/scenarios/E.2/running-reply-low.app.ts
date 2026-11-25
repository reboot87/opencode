/**
 * 对等性应用场景：运行中·回复·低·app。
 *
 * 规格编号：E.2。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `running-reply.app.ts` at the default transcript verbosity (low, #63207): the streaming reasoning and the
// running shell call fold into one status row.
import base from "./running-reply.app"

export default {
  ...base,
  config: { experimental: { "new-designs": true } },
  steps: base.steps.map((step) =>
    "checkpoint" in step && step.checkpoint !== "waiting" ? { ...step, until: "esc interrupt" } : step,
  ),
}
