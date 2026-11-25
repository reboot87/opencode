/**
 * 对等性应用场景：登录·code·伪终端。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// OAuth that needs a pasted code: the URL goes to the opener sink, then the code completes the attempt.
import { definePty } from "../../pty/run"
import { integrationRoutes, oauthRoutes, sink } from "./fixture"
import { enter, first, press } from "./keys"

export default definePty({
  args: ["auth", "login", "openai", "--method", "chatgpt"],
  env: sink,
  server: { routes: [...integrationRoutes(), ...oauthRoutes("openai", "code")] },
  steps: [first("Paste the authorization code", "code"), press("abc-123" + enter, "done", "Done")],
  osc: [],
  exits: true,
  requests: true,
})
