/**
 * 对等性应用场景：会话·列表·模拟。
 *
 * 规格编号：E.11a。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// Two sessions created on the server, then listed over the home
// (DLG16): opened with <leader>l, the first delete press marks the row, the second deletes the session on the
// server. The whole screen is compared except the home's placeholder row.
import { HOME_PLACEHOLDER } from "../../lib/app"
import { defineSim } from "../../sim/scenario"

const leader = { press: "x", modifiers: { ctrl: true } } as const
const remove = { press: "d", modifiers: { ctrl: true } } as const

export default defineSim({
  sessions: [
    { title: "Write docs", prompts: [] },
    { title: "Fix the parser", prompts: [] },
  ],
  model: [],
  steps: [
    { checkpoint: "home", until: "Simulated Model", masks: [HOME_PLACEHOLDER] },
    leader,
    { press: "l" },
    { checkpoint: "list", until: "Write docs" },
    remove,
    { checkpoint: "marked", until: "again to confirm" },
    remove,
    { checkpoint: "deleted", until: "delete ctrl+d" },
  ],
})
