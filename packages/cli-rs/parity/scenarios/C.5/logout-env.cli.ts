/**
 * 对等性应用场景：登出·环境变量·CLI。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { credentialWrites, integrationRoutes, sink } from "./fixture"

// `auth logout` of an integration connected through an environment variable.
export default defineCli({
  args: ["auth", "logout", "anthropic", "x"],
  env: sink,
  server: { routes: [...integrationRoutes(), ...credentialWrites] },
})
