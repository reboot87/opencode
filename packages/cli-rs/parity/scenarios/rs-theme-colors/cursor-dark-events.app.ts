/**
 * 对等性应用场景：光标·深色·事件·app。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import base from "../E.1/events.app"
import { themed } from "./themed"

export default themed(base, "cursor", "dark")
