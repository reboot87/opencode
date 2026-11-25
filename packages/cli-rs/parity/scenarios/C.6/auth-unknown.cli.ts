/**
 * 对等性应用场景：认证·未知·CLI。
 *
 * 规格编号：C.6。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { integrationRoutes } from "../C.5/fixture"
import { mcpRoute } from "./fixture"

// `mcp auth` of an unknown server.
export default defineCli({
  args: ["mcp", "auth", "nope"],
  server: { routes: [mcpRoute(), ...integrationRoutes()] },
})
