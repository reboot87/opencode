/**
 * 对等性应用场景：登录·方法·无·终端设备·CLI。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { integrationRoutes, sink } from "./fixture"

// `auth login` of an integration with several methods needs `--method` without a terminal.
export default defineCli({
  args: ["auth", "login", "openai"],
  env: sink,
  server: { routes: [...integrationRoutes()] },
})
