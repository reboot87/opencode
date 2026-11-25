/**
 * 对等性应用场景：enum·伪终端。
 *
 * 规格编号：C.15。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `session list --wizard`: an integer flag (a non-number beeps, a number is kept) and a choice flag.
import { definePty } from "../../pty/run"
import { list, location, sessions } from "../C.2/fixture"
import { down, enter, first, press } from "../C.5/keys"

export default definePty({
  args: ["session", "list", "--wizard"],
  server: { routes: [location, list(sessions)] },
  steps: [
    first("(--max-count)?", "max-count"),
    press("y", "max-count-empty", "(--max-count) ›"),
    press("x2", "max-count-typed"),
    press(enter, "format", "Set Output format (--format)?"),
    press("y", "format-choices", "table"),
    press(down, "format-json"),
    press(enter, "ready", "Run this command?"),
    press(enter, "ran", "ses_"),
  ],
  exits: true,
  requests: true,
})
