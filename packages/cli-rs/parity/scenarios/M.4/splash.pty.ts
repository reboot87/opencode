/**
 * 对等性应用场景：启动画面·伪终端。
 *
 * 规格编号：M.4。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `mini.splash: show`: the transcript starts under the entry header, and leaving writes the exit banner with the
// session's title and the command that resumes it.
import { definePty } from "../../pty/run"
import { config } from "./fixture"
import { server } from "../M.2/fixture"

export default definePty({
  args: ["mini", "-s", "ses_mini"],
  cols: 70,
  rows: 24,
  server: server(),
  setup: (root) => config(root, { splash: "show" }),
  steps: [
    { until: { screen: "Third answer" }, settle: 1_200, timeout: 30_000, checkpoint: "entry", scrollback: 4 },
    { keys: "\x03", settle: 200 },
    { keys: "\x03", settle: 800, checkpoint: "exit" },
  ],
  exits: true,
  masks: [
    {
      pattern: /^(ctrl\+x q \d+ pending · )?build · model · demo( · ctrl\+p menu)?$/,
      reason: "the status row is not under test",
    },
  ],
})
