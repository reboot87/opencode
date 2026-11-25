/**
 * 对等性应用场景：导出·目标·CLI。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { credentialRoute, integrationRoutes, sink } from "./fixture"

// `auth export <integration>`: only that integration's credentials.
export default defineCli({
  args: ["auth", "export", "openai"],
  env: sink,
  server: { routes: [...integrationRoutes(), credentialRoute()] },
})
