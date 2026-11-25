/**
 * 对等性应用场景：夹具。
 *
 * 规格编号：C.4。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// Shared routes for the C.4 `api` cases.
import type { Route } from "../../lib/fake-server"

export const openapi: Route = {
  path: "/openapi.json",
  json: {
    paths: {
      "/api/session": { parameters: [], get: { operationId: "session.list" } },
      "/api/session/{sessionID}": {
        get: { operationId: "session.get" },
        delete: { operationId: "session.remove" },
      },
    },
  },
}
