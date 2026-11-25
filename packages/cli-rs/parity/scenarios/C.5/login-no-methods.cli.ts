/**
 * 对等性应用场景：登录·无·方法·CLI。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { integrationRoutes, integrations, sink } from "./fixture"

// `auth login` of an integration that only reads environment variables.
export default defineCli({
  args: ["auth", "login", "anthropic-env"],
  env: sink,
  server: {
    routes: [
      ...integrationRoutes([
        ...integrations,
        { id: "anthropic-env", name: "Env only", methods: [{ type: "env", names: ["X"] }], connections: [] },
      ]),
    ],
  },
})
