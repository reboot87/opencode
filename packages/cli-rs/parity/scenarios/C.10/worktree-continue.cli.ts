/**
 * 对等性应用场景：工作树·续接·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `-w` starts a new session, so it cannot be combined with `-c`.
import { defineCli } from "../../cli/run"
import { server } from "./fixture"

export default defineCli({ args: ["run", "-w", "-c", "hi"], server: server() })
