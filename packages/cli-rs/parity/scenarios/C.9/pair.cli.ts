/**
 * 对等性应用场景：pair·CLI。
 *
 * 规格编号：C.9。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `pair` against the registered service: links for every server URL, a QR code of the reachable ones, and the
// SSH hint on stderr because the service listens on a loopback address.
import { defineCli } from "../../cli/run"
import { env, info, masked, pairRoute, register } from "../C.8/fixture"

export default defineCli({
  args: [],
  command: masked(["pair"]),
  env,
  server: { version: false, routes: [info(["http://127.0.0.1:4096", "http://192.168.1.20:4096"]), pairRoute] },
  setup: register,
})
