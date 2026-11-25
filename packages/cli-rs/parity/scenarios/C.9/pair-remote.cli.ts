/**
 * 对等性应用场景：pair·远程·CLI。
 *
 * 规格编号：C.9。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `pair --remote` with remote access already on: no consent and no tunnel setup; the link is the tunnel URL from
// `/api/info` whose host is `<route>.<tunnel hostname>`, with its QR code and no SSH hint.
import { defineCli } from "../../cli/run"
import { env, info, only, pairRoute, register, tunnel, writeConfig } from "../C.8/fixture"

export default defineCli({
  args: [],
  command: only(["pair", "--remote"]),
  env,
  server: {
    version: false,
    routes: [info(["http://127.0.0.1:4096", "https://0123456789abcdef.t1.opentunnel.test"]), pairRoute],
  },
  setup: async (root, server, password) => {
    await writeConfig(root, { remote: { route: "0123456789abcdef" } })
    await tunnel(root, "t1.opentunnel.test")
    await register(root, server, password)
  },
})
