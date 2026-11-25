/**
 * 对等性应用场景：pair·URL·CLI。
 *
 * 规格编号：C.9。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `pair --url`: the given external URL replaces the server's, and there is no SSH hint.
import { defineCli } from "../../cli/run"
import { env, info, only, pairRoute, register } from "../C.8/fixture"

export default defineCli({
  args: [],
  command: only(["pair", "--url", "https://opencode.example/base/"]),
  env,
  server: { version: false, routes: [info(["http://127.0.0.1:4096"]), pairRoute] },
  setup: register,
})
