/**
 * 对等性应用场景：登录·方法·缺失·CLI。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { integrationRoutes, sink } from "./fixture"

// `auth login --method` with an unknown method lists the available ones.
export default defineCli({
  args: ["auth", "login", "openai", "--method", "nope"],
  env: sink,
  server: { routes: [...integrationRoutes()] },
})
