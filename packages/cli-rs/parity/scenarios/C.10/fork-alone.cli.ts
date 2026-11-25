/**
 * 对等性应用场景：分叉·alone·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `--fork` needs `--continue` or `--session`.
import { defineCli } from "../../cli/run"
import { nowMask, server } from "./fixture"

export default defineCli({ args: ["run", "--fork", "--format", "json", "hi"], server: server(), masks: [nowMask] })
