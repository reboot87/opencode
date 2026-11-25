/**
 * 对等性应用场景：删除线·模拟。
 *
 * 规格编号：OT。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// A reply that contains `~~gone~~`: the tildes hide and the text is muted and struck through (OpenTUI #2079, on both
// sides since 0.9.4).
import { defineSim } from "../../sim/scenario"

const duration = { line: "· \\d.*", reason: "the turn duration depends on timing, also in length; the row ends there" }

export default defineSim({
  model: [{ items: [{ type: "textDelta", text: "Answer a ~~gone~~ b." }] }],
  steps: [
    { until: "Simulated Model" },
    { type: "Strike it" },
    { until: "Strike it" },
    { enter: true },
    { checkpoint: "done", until: "Answer a", masks: [duration] },
  ],
})
