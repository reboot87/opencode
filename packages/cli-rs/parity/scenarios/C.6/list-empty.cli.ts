/**
 * 对等性应用场景：列表·空值·CLI。
 *
 * 规格编号：C.6。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { mcpRoute } from "./fixture"

// `mcp list` without servers.
export default defineCli({
  args: ["mcp", "list"],
  server: { routes: [mcpRoute([])] },
})
