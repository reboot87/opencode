/**
 * 对等性应用场景：无·消息·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// Only white space, a BOM included, and empty stdin: an error, exit 1, nothing created.
import { defineCli } from "../../cli/run"
import { server } from "./fixture"

export default defineCli({ args: ["run", " \uFEFF\u3000 "], server: server() })
