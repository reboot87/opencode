/**
 * 对等性应用场景：列表·CLI。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { integrationRoutes, sink } from "./fixture"

// `auth list`: one row per connection, stored credentials and environment variables.
export default defineCli({
  args: ["auth", "list"],
  env: sink,
  server: { routes: [...integrationRoutes()] },
})
