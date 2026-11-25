/**
 * 对等性应用场景：导出·未知·CLI。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { credentialRoute, integrationRoutes, sink } from "./fixture"

// `auth export` of an unknown integration.
export default defineCli({
  args: ["auth", "export", "nope"],
  env: sink,
  server: { routes: [...integrationRoutes(), credentialRoute()] },
})
