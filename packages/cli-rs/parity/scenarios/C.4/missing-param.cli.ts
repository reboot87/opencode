/**
 * 对等性应用场景：缺失·参数·CLI。
 *
 * 规格编号：C.4。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `api session.get` without `sessionID`: no request beyond the document. The message differs on purpose
// (C40-handler-errors); only the exit and the requests are compared.
import { defineCli } from "../../cli/run"
import { openapi } from "./fixture"

export default defineCli({
  args: ["api", "session.get"],
  server: { routes: [openapi] },
  stderrLines: 0,
})
