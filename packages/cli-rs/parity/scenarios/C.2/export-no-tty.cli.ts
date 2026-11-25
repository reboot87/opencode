/**
 * 对等性应用场景：导出·无·终端设备·CLI。
 *
 * 规格编号：C.2。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `session export` without an ID and without a terminal fails before it connects.
import { defineCli } from "../../cli/run"
import { exportRoute } from "./fixture"

export default defineCli({ args: ["session", "export"], server: { routes: [exportRoute()] } })
