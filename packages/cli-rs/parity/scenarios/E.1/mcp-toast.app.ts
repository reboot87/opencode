/**
 * 对等性应用场景：MCP·轻提示·app。
 *
 * 规格编号：E.1。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// An MCP server of the default location that failed shows a toast once (T12).
import { defineApp, HOME_PLACEHOLDER, location } from "../../lib/app"

// The home prompt's placeholder row: its example is random.
const prompt = [HOME_PLACEHOLDER]

export default defineApp({
  routes: [
    {
      path: "/api/mcp",
      json: { location, data: [{ name: "github", status: { status: "failed", error: "spawn ENOENT" } }] },
    },
  ],
  steps: [{ checkpoint: "failed", until: "MCP server failed: github", masks: prompt }],
})
