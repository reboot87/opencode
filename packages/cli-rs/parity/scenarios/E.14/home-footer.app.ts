/**
 * 对等性应用场景：主目录·页脚·app。
 *
 * 规格编号：E.14。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// The home footer (F01): the connected MCP servers of the default location with `/mcps`, then the version.
import { defineApp, HOME_PLACEHOLDER, location } from "../../lib/app"

export default defineApp({
  config: { experimental: { "new-designs": true } },
  routes: [
    {
      path: "/api/mcp",
      json: {
        location,
        data: [
          { name: "github", status: { status: "connected" } },
          { name: "linear", status: { status: "connected" } },
          { name: "figma", status: { status: "disabled" } },
        ],
      },
    },
  ],
  steps: [{ checkpoint: "counts", until: "2 MCP", masks: [HOME_PLACEHOLDER] }],
})
