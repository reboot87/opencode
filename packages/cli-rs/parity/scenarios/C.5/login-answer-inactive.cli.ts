/**
 * 对等性应用场景：登录·回答·未激活·CLI。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { integrationRoutes, sink } from "./fixture"

// `auth login` stops at the first unanswered field before it reaches an inactive one.
export default defineCli({
  args: ["auth", "login", "acme", "--answer", "region=us", "--answer", "eu-only=yes"],
  env: sink,
  server: { routes: [...integrationRoutes()] },
})
