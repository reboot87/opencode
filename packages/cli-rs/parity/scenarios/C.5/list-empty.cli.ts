/**
 * 对等性应用场景：列表·空值·CLI。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { integrationRoutes, integrations, sink } from "./fixture"

// `auth list` when nothing is connected.
export default defineCli({
  args: ["auth", "list"],
  env: sink,
  server: { routes: [...integrationRoutes(integrations.map((item) => ({ ...item, connections: [] })))] },
})
