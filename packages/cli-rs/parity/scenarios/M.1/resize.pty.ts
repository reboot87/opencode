/**
 * 对等性应用场景：调整尺寸·伪终端。
 *
 * 规格编号：M.1。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// A resize replays the transcript at the new width: the terminal is cleared, the messages are listed again, and the
// header and the wrapped rows follow the new width. The history is plain text (prompts and errors).
import { definePty } from "../../pty/run"
import { config, plain, server, statusMask } from "./fixture"

export default definePty({
  args: ["mini", "-s", "ses_mini"],
  cols: 60,
  rows: 16,
  server: server({ messages: plain }),
  setup: (root) => config(root),
  steps: [
    { until: { screen: "Rate limited" }, settle: 600, timeout: 30_000 },
    { resize: { cols: 24, rows: 16 }, settle: 1500, checkpoint: "narrow", scrollback: 24 },
    { keys: "\x03", settle: 200 },
    { keys: "\x03", settle: 400 },
  ],
  exits: true,
  masks: [statusMask],
})
