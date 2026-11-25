/**
 * 对等性应用场景：pair·错误·CLI。
 *
 * 规格编号：C.9。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// The errors before anything connects: --remote with --url, and the disabled service. (An invalid --url is a
// usage error, which the Rust parser reports in its own format; see the C.8 report.)
import { defineCli } from "../../cli/run"
import { env, script, writeConfig } from "../C.8/fixture"

export default defineCli({
  args: [],
  command: script([
    ["pair", "--remote", "--url", "https://example.com"],
    ["pair"],
  ]),
  env,
  setup: (root) => writeConfig(root, { disabled: true }),
})
