/**
 * 对等性应用场景：登录·external·缺失·CLI。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { integrationRoutes, sink } from "./fixture"

// `auth login` with a form field left unanswered needs a terminal.
export default defineCli({
  args: ["auth", "login", "acme", "--answer", "region=us"],
  env: sink,
  server: { routes: [...integrationRoutes()] },
})
