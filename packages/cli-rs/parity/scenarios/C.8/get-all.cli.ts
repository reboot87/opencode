/**
 * 对等性应用场景：get·全部·CLI。
 *
 * 规格编号：C.8。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `service get` without a key: the config as JSON, without the password and with the route hidden.
import { defineCli } from "../../cli/run"
import { env, only, writeConfig } from "./fixture"

export default defineCli({
  args: [],
  command: only(["service", "get"]),
  env,
  setup: (root) =>
    writeConfig(root, {
      disabled: false,
      remote: { route: "0123456789abcdef" },
      remoteAccepted: true,
      hostname: "0.0.0.0",
      port: 5000,
      password: "secret",
      cors: ["https://app.example"],
      env: { HTTPS_PROXY: "http://proxy:8080", A: "b" },
    }),
})
