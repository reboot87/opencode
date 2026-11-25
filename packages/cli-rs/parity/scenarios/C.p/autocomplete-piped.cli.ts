/**
 * 对等性应用场景：自动补全·piped·CLI。
 *
 * 规格编号：C.p。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { demo } from "./demo"

export default defineCli({ args: [], command: demo("autocomplete"), stdin: "item 2\x1b[B\r" })
