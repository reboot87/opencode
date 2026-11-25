/**
 * 对等性应用场景：登出·无·凭据·CLI。
 *
 * 规格编号：C.6。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { integrations, location } from "../C.5/fixture"
import { mcpRoute } from "./fixture"

// `mcp logout` of an integration without stored credentials.
export default defineCli({
  args: ["mcp", "logout", "linear"],
  server: { routes: [mcpRoute(), { path: "/api/integration/mcp-linear", json: { location, data: integrations[5] } }] },
})
