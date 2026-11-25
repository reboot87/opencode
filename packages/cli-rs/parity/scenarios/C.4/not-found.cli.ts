/**
 * 对等性应用场景：非·found·CLI。
 *
 * 规格编号：C.4。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// An operation the document does not have. TS hides the message in the cause of an `UnknownError` and a
// stack trace; Rust prints it (C40-handler-errors). Only the exit and the requests are compared.
import { defineCli } from "../../cli/run"
import { openapi } from "./fixture"

export default defineCli({
  args: ["api", "session.nope"],
  server: { routes: [openapi] },
  stderrLines: 0,
})
