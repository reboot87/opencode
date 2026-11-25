/**
 * 对等性应用场景：版本·CLI。
 *
 * 规格编号：H.3。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `--version` prints `<name> v<version>` and needs no server. Both sides run from source, so both
// report `local`.
import { defineCli } from "../../cli/run"

export default defineCli({ args: ["--version"] })
