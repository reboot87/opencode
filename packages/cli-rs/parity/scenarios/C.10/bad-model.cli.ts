/**
 * 对等性应用场景：糟糕·模型·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// An invalid `-m` fails before anything is created.
import { defineCli } from "../../cli/run"
import { server } from "./fixture"

export default defineCli({ args: ["run", "-m", "nomodel", "hi"], server: server() })
