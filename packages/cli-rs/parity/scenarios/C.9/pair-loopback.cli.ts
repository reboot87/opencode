/**
 * 对等性应用场景：pair·loopback·CLI。
 *
 * 规格编号：C.9。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `pair` when every URL is a loopback address: no QR code. The expiry rounds to whole minutes.
import { defineCli } from "../../cli/run"
import { env, info, masked, register } from "../C.8/fixture"

export default defineCli({
  args: [],
  command: masked(["pair"]),
  env,
  server: {
    version: false,
    routes: [
      info(["http://localhost:4096", "http://[::1]:4096"]),
      { method: "POST", path: "/api/pair", json: { code: "PAIRCODE42", expires_in: 150 } },
    ],
  },
  setup: register,
})
