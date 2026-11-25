/**
 * 对等性应用场景：转义·伪终端。
 *
 * 规格编号：C.15。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `--wizard` at the root: the subcommand list pages ten at a time and wraps around; Escape cancels.
import { definePty } from "../../pty/run"
import { down, escape, first, press } from "../C.5/keys"

export default definePty({
  args: ["--wizard"],
  steps: [
    first("Command", "root"),
    press("k", "wrapped", "serve"),
    press("j", "back"),
    press(down.repeat(6), "middle"),
    press(escape, "cancelled", "Wizard cancelled."),
  ],
  exits: true,
})
