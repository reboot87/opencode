/**
 * 对等性应用场景：补全·PowerShell·CLI。
 *
 * 规格编号：C.0。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { ownFlags } from "./own-flags"

export default defineCli({ args: ["--completions", "powershell"], masks: ownFlags })
