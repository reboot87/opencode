/**
 * 对等性应用场景：认证·选择器·伪终端。
 *
 * 规格编号：C.6。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `mcp auth` on a terminal: the MCP server picker with status hints, then OAuth with the browser sink.
import { definePty } from "../../pty/run"
import { credentialWrites, integrationRoutes, oauthRoutes, sink } from "../C.5/fixture"
import { down, enter, first, press } from "../C.5/keys"
import { mcpRoute } from "./fixture"

export default definePty({
  args: ["mcp", "auth"],
  env: sink,
  server: { routes: [mcpRoute(), ...integrationRoutes(), ...oauthRoutes("mcp-linear"), ...credentialWrites] },
  steps: [first("Select MCP server", "picker"), press(down, "moved"), press(enter, "done", "Done")],
  osc: [],
  exits: true,
  requests: true,
})
