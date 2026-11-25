/**
 * 对等性应用场景：switch·无·CLI。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { credentialWrites, integrationRoutes, sink } from "./fixture"

// `auth switch` for an integration without stored credentials.
export default defineCli({
  args: ["auth", "switch", "opencode-go", "x"],
  env: sink,
  server: { routes: [...integrationRoutes(), ...credentialWrites] },
})
