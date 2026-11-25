/**
 * 对等性应用场景：认证·拒绝·伪终端。
 *
 * 规格编号：C.6。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `mcp auth <connected server>` on a terminal asks before re-authenticating; No ends with "Cancelled".
import { definePty } from "../../pty/run"
import { integrationRoutes, sink } from "../C.5/fixture"
import { enter, first, press, right } from "../C.5/keys"
import { mcpRoute } from "./fixture"

export default definePty({
  args: ["mcp", "auth", "github"],
  env: sink,
  server: { routes: [mcpRoute(), ...integrationRoutes()] },
  steps: [first("Re-authenticate?", "confirm"), press(right, "no"), press(enter, "cancelled", "Cancelled")],
  osc: [],
  exits: true,
  requests: true,
})
