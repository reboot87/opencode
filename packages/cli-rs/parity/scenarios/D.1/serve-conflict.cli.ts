/**
 * 对等性应用场景：serve·冲突·CLI。
 *
 * 规格编号：D.1。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `serve --service --stdio` fails before it starts anything ("--service and --stdio cannot be combined").
import { defineCli } from "../../cli/run"
import { env } from "./ts"

export default defineCli({ args: ["serve", "--service", "--stdio"], env })
