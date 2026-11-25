/**
 * 对等性应用场景：pair·远程·无·终端设备·CLI。
 *
 * 规格编号：C.9。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `pair --remote` for the first time without a terminal and without --yes: the warning, and exit 1. Nothing is
// written and no tunnel is created.
import { defineCli } from "../../cli/run"
import { env, script } from "../C.8/fixture"

export default defineCli({
  args: [],
  command: script([["pair", "--remote"]], { cat: true }),
  env,
})
