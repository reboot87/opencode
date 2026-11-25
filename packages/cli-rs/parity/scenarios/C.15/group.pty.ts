/**
 * 对等性应用场景：分组·伪终端。
 *
 * 规格编号：C.15。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `debug --wizard`: picks a subcommand, then sets its optional choice argument, and runs the command.
import { definePty } from "../../pty/run"
import { down, enter, first, press } from "../C.5/keys"

export default definePty({
  args: ["debug", "--wizard"],
  steps: [
    first("Command", "command"),
    press(down + down + down, "paths"),
    press(enter, "set-name", "Set Name?"),
    press("y", "name", "db"),
    press(down, "name-home"),
    press(enter, "ready", "Run this command?"),
    press(enter, "ran", "home"),
  ],
  exits: true,
})
