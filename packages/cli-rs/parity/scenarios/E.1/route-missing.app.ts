/**
 * 对等性应用场景：路由·缺失·app。
 *
 * 规格编号：E.1。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `OPENCODE_ROUTE` names a plugin route no plugin registers (T14b, T26): the missing route screen, centered.
import { defineApp, location } from "../../lib/app"

// Rust reads the default location's catalogs at startup on every route (the prompt and model state); TS
// reads none on a plugin route. Answering them keeps P-REQ to the reads both sides send.
const catalog = (path: string) => ({ path, json: { location, data: [] } })

export default defineApp({
  routes: [
    ...["/api/model", "/api/provider", "/api/agent", "/api/integration"].map(catalog),
    { path: "/api/config", json: [] },
  ],
  env: { OPENCODE_ROUTE: JSON.stringify({ type: "plugin", id: "acme.tools", name: "board" }) },
  steps: [{ checkpoint: "missing", until: "go home" }],
})
