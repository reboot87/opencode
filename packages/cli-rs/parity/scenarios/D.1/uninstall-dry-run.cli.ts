/**
 * 对等性应用场景：卸载·dry·运行·CLI。
 *
 * 规格编号：D.1。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `uninstall --dry-run` lists what it would remove from the sandbox's roots and changes nothing.
import { defineCli } from "../../cli/run"
import { env } from "./ts"

export default defineCli({ args: ["uninstall", "--dry-run"], env })
