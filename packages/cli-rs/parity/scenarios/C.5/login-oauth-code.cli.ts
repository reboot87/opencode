/**
 * 对等性应用场景：登录·OAuth·code·CLI。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { integrationRoutes, oauthRoutes, sink } from "./fixture"

// `auth login --method <label>`: an OAuth attempt that needs a pasted code fails without a terminal.
export default defineCli({
  args: ["auth", "login", "openai", "--method", "ChatGPT Pro/Plus"],
  env: sink,
  server: { routes: [...integrationRoutes(), ...oauthRoutes("openai", "code")] },
})
