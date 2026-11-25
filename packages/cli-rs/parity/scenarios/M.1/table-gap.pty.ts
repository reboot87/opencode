/**
 * 对等性应用场景：表格·gap·伪终端。
 *
 * 规格编号：M.1。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// Mini replays two replies of three blocks each, a paragraph, a left-aligned table and a paragraph, then three
// paragraphs. Both clients commit a reply's leading blocks first and the rest at the end, and both keep the blank row
// at that cut (before the table, before `Three.`), as the replies rendered whole show. TS lost it before #63989.
import { definePty } from "../../pty/run"
import { assistant, config, server, statusMask, user } from "./fixture"

const table = ["Packing list:", "", "| Item | Qty |", "| --- | --- |", "| Tent | 1 |", "| Stove | 2 |", "", "Done."]

const messages = [
  user("msg_u1", "pack", 10),
  assistant("msg_a1", [{ type: "text", text: table.join("\n") }], 11),
  user("msg_u2", "count", 12),
  assistant("msg_a2", [{ type: "text", text: "One.\n\nTwo.\n\nThree." }], 13),
]

export default definePty({
  args: ["mini", "-s", "ses_mini"],
  cols: 60,
  rows: 24,
  server: server({ messages }),
  setup: (root) => config(root),
  steps: [
    {
      until: { screen: "Three." },
      settle: 800,
      timeout: 30_000,
      checkpoint: "replayed",
    },
    { keys: "\x03", settle: 200 },
    { keys: "\x03", settle: 400 },
  ],
  exits: true,
  masks: [statusMask],
})
