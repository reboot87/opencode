/**
 * 对等性应用场景：Mermaid·opens·app。
 *
 * 规格编号：P.2。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// A diagram that opens the text: TS keeps its renderer's row of top margin above it, the Rust Markdown puts no row
// before the first block (`parity/deviations/F12-mermaid-leading-row.md`).
import { assistant, defineApp, session, user } from "../../lib/app"

export default defineApp({
  args: { sessionID: "ses_d" },
  routes: [
    { path: "/api/session/ses_d", json: { data: session("ses_d", "Draw the flow", { updated: 2 }) } },
    {
      path: "/api/session/ses_d/message",
      json: {
        data: [
          assistant("msg_2", "```mermaid\nflowchart LR\n  A --> B\n```\n\nThat is the flow.", 2000),
          user("msg_1", "Flow?", 1000),
        ],
        cursor: {},
      },
    },
    { path: "/api/session/ses_d/inbox", json: { data: [] } },
  ],
  steps: [
    {
      checkpoint: "open",
      until: "That is the flow.",
      // Without TS's row above the diagram, rows 0 to 12 are equal cell for cell.
      deviation: [{ file: "F12-mermaid-leading-row", cells: 140 }],
    },
  ],
})
