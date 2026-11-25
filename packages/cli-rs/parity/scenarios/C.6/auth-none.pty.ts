/**
 * 对等性应用场景：认证·无·伪终端。
 *
 * 规格编号：C.6。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `mcp auth` without OAuth-capable servers explains how to add one.
import { definePty } from "../../pty/run"
import { integrationRoutes, sink } from "../C.5/fixture"
import { first } from "../C.5/keys"
import { mcpRoute, servers } from "./fixture"

export default definePty({
  args: ["mcp", "auth"],
  env: sink,
  server: { routes: [mcpRoute(servers.slice(2)), ...integrationRoutes()] },
  steps: [first("Done", "done")],
  osc: [],
  exits: true,
  requests: true,
})
