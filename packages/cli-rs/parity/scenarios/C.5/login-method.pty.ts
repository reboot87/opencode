/**
 * 对等性应用场景：登录·方法·伪终端。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `auth login <integration>` with several methods: the method select, then Escape at the key prompt.
import { definePty } from "../../pty/run"
import { integrationRoutes, sink } from "./fixture"
import { down, enter, escape, first, press } from "./keys"

export default definePty({
  args: ["auth", "login", "OpenAI"],
  env: sink,
  server: { routes: [...integrationRoutes()] },
  steps: [
    first("Select login method", "methods"),
    press(down, "moved"),
    press(enter, "key", "Manually enter API Key"),
    press(escape, "cancelled", "Cancelled"),
  ],
  osc: [],
  exits: true,
  requests: true,
})
