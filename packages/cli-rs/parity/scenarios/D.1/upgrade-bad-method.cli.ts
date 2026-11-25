/**
 * 对等性应用场景：升级·糟糕·方法·CLI。
 *
 * 规格编号：D.1。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `upgrade --method apt`: a choice the flag does not take is a usage error before anything runs, as in TS. Past its
// parsing, `opencode-native upgrade` upgrades nothing and says how it is updated (deviation D01-upgrade), so this is
// what P-CLI can compare of it.
import { defineCli } from "../../cli/run"

export default defineCli({ args: ["upgrade", "--method", "apt"] })
