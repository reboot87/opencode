/**
 * 对等性应用场景：piped·空值·CLI。
 *
 * 规格编号：C.15。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `debug --wizard` with nothing on stdin: the subcommand select meets the end of input, so the wizard is
// cancelled with exit 0 and nothing runs.
import { defineCli } from "../../cli/run"

export default defineCli({ args: ["debug", "--wizard"], stdin: "" })
