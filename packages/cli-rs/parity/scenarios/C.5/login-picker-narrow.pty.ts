/**
 * 对等性应用场景：登录·选择器·窄·伪终端。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// The integration picker on a small terminal: compact headings, the short footer, a search without
// matches, Enter asking again, then Escape.
import { definePty } from "../../pty/run"
import { integrationRoutes, sink } from "./fixture"
import { enter, escape, first, press } from "./keys"

export default definePty({
  args: ["auth", "login"],
  cols: 45,
  rows: 17,
  env: sink,
  server: { routes: [...integrationRoutes()] },
  steps: [
    first("Select integration", "picker"),
    press("zzz", "empty", "No integrations found"),
    // The error line shows only with matches; the title turns to the error symbol.
    press(enter, "error", "▲  Select integration"),
    press(escape, "cancelled", "Cancelled"),
  ],
  osc: [],
  exits: true,
  requests: true,
})
