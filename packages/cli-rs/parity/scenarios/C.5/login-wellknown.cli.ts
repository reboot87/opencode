/**
 * 对等性应用场景：登录·wellknown·CLI。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { integrationRoutes, integrations, oauthRoutes, sink } from "./fixture"

// `auth login <url>`: discovers the provider, then logs in to the integration it adds.
export default defineCli({
  args: ["auth", "login", "https://mcp.example.test/"],
  env: sink,
  server: {
    routes: [
      ...integrationRoutes([
        ...integrations,
        {
          id: "https://mcp.example.test",
          name: "Example MCP",
          methods: [{ id: "oauth", type: "oauth", label: "OAuth" }],
          connections: [],
        },
      ]),
      { method: "POST", path: "/api/experimental/integration/wellknown", status: 204 },
      ...oauthRoutes("https%3A%2F%2Fmcp.example.test"),
    ],
  },
})
