/**
 * 对等性应用场景：登录·Future·类型·必填·伪终端。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `auth login` for a required form field of a type this client does not know: the text prompt refuses an
// empty answer, then Escape cancels.
import { definePty } from "../../pty/run"
import { futureRoutes, sink } from "./fixture"
import { enter, escape, first, press } from "./keys"

export default definePty({
  args: ["auth", "login", "future"],
  env: sink,
  server: { routes: futureRoutes({ title: "Region", required: true }) },
  steps: [first("Region", "prompt"), press(enter, "required", "Required"), press(escape, "cancelled", "Cancelled")],
  osc: [],
  exits: true,
  requests: true,
})
