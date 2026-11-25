/**
 * 对等性应用场景：登录·快捷键·CLI。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { commandRoutes, integrationRoutes, sink } from "./fixture"

// The hidden `login` shortcut runs `auth login`: the same command method as login-command, by the short name.
export default defineCli({
  args: ["login", "zed"],
  env: sink,
  server: { routes: [...integrationRoutes(), ...commandRoutes("zed")] },
})
