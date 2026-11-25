/**
 * 对等性应用场景：history·伪终端。
 *
 * 规格编号：M.2。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// Up at the start steps back through the session's prompts, Down at the end steps forward and restores the draft.
import { definePty } from "../../pty/run"
import { config, leave, opened, server, statusMask } from "./fixture"

export default definePty({
  args: ["mini", "-s", "ses_mini"],
  cols: 60,
  rows: 20,
  server: server(),
  setup: (root) => config(root),
  steps: [
    opened,
    { keys: "draft", settle: 200 },
    { keys: "\x1b[A", settle: 300, checkpoint: "start" },
    { keys: "\x1b[A", settle: 300, checkpoint: "third" },
    { keys: "\x1b[A", settle: 300, checkpoint: "second" },
    { keys: "\x1b[B", settle: 300 },
    { keys: "\x1b[B", settle: 300, checkpoint: "third-end" },
    { keys: "\x1b[B", settle: 300, checkpoint: "draft" },
    ...leave,
  ],
  exits: true,
  masks: [statusMask],
  requests: "writes",
})
