/**
 * 对等性应用场景：debug·智能体·CLI。
 *
 * 规格编号：C.1。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `debug agents`: the agents as the server sent them, unknown fields and key order kept, sorted by id.
import { defineCli } from "../../cli/run"

export default defineCli({
  args: ["debug", "agents"],
  server: {
    routes: [
      {
        path: "/api/agent",
        json: {
          location: { directory: "/work" },
          data: [
            { id: "plan", name: "Plan", mode: "primary", extra: { nested: [1, 2.5, null, true] } },
            { id: "build", name: "Build", mode: "primary", unicode: "héllo ✓ \u0001" },
            { id: "Explore", name: "Explore", mode: "subagent", permission: [] },
            { id: "general", mode: "subagent", description: 'A "quoted" description' },
          ],
        },
      },
    ],
  },
})
