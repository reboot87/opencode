/**
 * 对等性应用场景：登出·CLI。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { credentialWrites, integrationRoutes, sink } from "./fixture"

// `auth logout <integration> <label>`: the label matches without regard to case.
export default defineCli({
  args: ["auth", "logout", "openai", "personal"],
  env: sink,
  server: { routes: [...integrationRoutes(), ...credentialWrites] },
})
