/**
 * 对等性应用场景：登录·wellknown·失败·CLI。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { integrationRoutes, sink } from "./fixture"

// `auth login <url>` when discovery fails.
export default defineCli({
  args: ["auth", "login", "https://mcp.example.test"],
  env: sink,
  server: {
    routes: [
      ...integrationRoutes(),
      {
        method: "POST",
        path: "/api/experimental/integration/wellknown",
        status: 400,
        json: { _tag: "BadRequest", message: "No well-known metadata" },
      },
    ],
  },
})
