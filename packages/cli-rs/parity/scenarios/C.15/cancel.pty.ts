/**
 * 对等性应用场景：取消·伪终端。
 *
 * 规格编号：C.15。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// Ctrl+C in a text prompt of `session import --wizard`: "Wizard cancelled.", exit 0, nothing imported.
import { definePty } from "../../pty/run"
import { enter, first, press } from "../C.5/keys"

export default definePty({
  args: ["session", "import", "--wizard"],
  server: { routes: [] },
  steps: [
    first("(--directory)?", "directory"),
    press(enter, "file", "File ›"),
    press("notes.json", "file-typed"),
    press("\x03", "cancelled", "Wizard cancelled."),
  ],
  exits: true,
  requests: true,
})
