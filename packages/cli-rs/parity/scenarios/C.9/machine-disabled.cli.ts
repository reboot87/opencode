/**
 * 对等性应用场景：状态机·禁用·CLI。
 *
 * 规格编号：C.9。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `machine` needs the background service: with it disabled, each subcommand says so before connecting.
import { defineCli } from "../../cli/run"
import { env, script, writeConfig } from "../C.8/fixture"

export default defineCli({
  args: [],
  command: script([
    ["machine", "list"],
    ["machine", "remove", "gpu"],
  ]),
  env,
  setup: (root) => writeConfig(root, { disabled: true }),
})
