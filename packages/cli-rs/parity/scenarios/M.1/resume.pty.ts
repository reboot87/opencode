/**
 * 对等性应用场景：恢复·伪终端。
 *
 * 规格编号：M.1。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `mini -s ses_mini`: the session's history is replayed into the scrollback above the footer, then Ctrl+C twice
// leaves split mode. The footer itself is M.2's and M.3's, so the rows below the transcript are masked.
import { definePty } from "../../pty/run"
import { config, server, statusMask } from "./fixture"

export default definePty({
  args: ["mini", "-s", "ses_mini"],
  cols: 60,
  rows: 16,
  server: server(),
  setup: (root) => config(root),
  steps: [
    { until: { screen: "Third answer" }, settle: 600, timeout: 30_000, checkpoint: "resume", scrollback: 16 },
    { keys: "\x03", settle: 200 },
    { keys: "\x03", settle: 400, checkpoint: "exit" },
  ],
  exits: true,
  masks: [statusMask],
})
