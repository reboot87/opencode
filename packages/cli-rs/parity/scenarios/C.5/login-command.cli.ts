/**
 * 对等性应用场景：登录·命令·CLI。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { commandRoutes, integrationRoutes, sink } from "./fixture"

// `auth login` with a command method: the command completes, then the attempt is released.
export default defineCli({
  args: ["auth", "login", "zed"],
  env: sink,
  server: { routes: [...integrationRoutes(), ...commandRoutes("zed")] },
})
