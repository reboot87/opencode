/**
 * 对等性应用场景：OpenAPI·错误·CLI。
 *
 * 规格编号：C.4。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// The document fails to load. The message differs on purpose (C40-handler-errors); only the exit and the
// requests are compared.
import { defineCli } from "../../cli/run"

export default defineCli({
  args: ["api", "session.list"],
  server: { routes: [{ path: "/openapi.json", status: 500, json: { message: "no" } }] },
  stderrLines: 0,
})
