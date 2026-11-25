/**
 * 对等性应用场景：插件·移除·缺失·CLI。
 *
 * 规格编号：D.1。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `plugin remove` of a package that no config lists: nothing is written.
import { defineCli } from "../../cli/run"
import { env } from "./ts"

export default defineCli({ args: ["plugin", "remove", "not-configured"], env })
