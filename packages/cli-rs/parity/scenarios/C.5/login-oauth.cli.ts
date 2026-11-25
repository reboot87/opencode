/**
 * 对等性应用场景：登录·OAuth·CLI。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { integrationRoutes, oauthRoutes, sink } from "./fixture"

// `auth login --method <id>`: OAuth without a terminal, so no browser; the attempt completes, then is released.
export default defineCli({
  args: ["auth", "login", "openai", "--method", "chatgpt"],
  env: sink,
  server: { routes: [...integrationRoutes(), ...oauthRoutes("openai")] },
})
