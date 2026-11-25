/**
 * 对等性应用场景：括号·转义·模拟。
 *
 * 规格编号：OT。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// A reply with a bracketed label that is not a link and a backslash escape: the brackets show and the backslash
// goes, as CommonMark says (OpenTUI #2049, on both sides since 0.9.4).
import { defineSim } from "../../sim/scenario"

const duration = { line: "· \\d.*", reason: "the turn duration depends on timing, also in length; the row ends there" }

export default defineSim({
  model: [
    {
      items: [
        {
          type: "textDelta",
          text: ["[shell] hello-again", "", 'Invalid arguments for tool \\"prune\\".'].join("\n"),
        },
      ],
    },
  ],
  steps: [
    { until: "Simulated Model" },
    { type: "Show the labels" },
    { until: "Show the labels" },
    { enter: true },
    { checkpoint: "done", until: "prune", masks: [duration] },
  ],
})
