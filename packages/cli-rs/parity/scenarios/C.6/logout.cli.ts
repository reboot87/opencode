/**
 * 对等性应用场景：登出·CLI。
 *
 * 规格编号：C.6。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { credentialWrites, integrations, location } from "../C.5/fixture"
import { mcpRoute } from "./fixture"

// `mcp logout` removes every stored credential of the server's integration.
export default defineCli({
  args: ["mcp", "logout", "github"],
  server: {
    routes: [
      mcpRoute(),
      { path: "/api/integration/mcp-github", json: { location, data: integrations[4] } },
      ...credentialWrites,
    ],
  },
})
