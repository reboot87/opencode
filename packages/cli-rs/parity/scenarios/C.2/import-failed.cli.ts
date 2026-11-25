/**
 * 对等性应用场景：导入·失败·CLI。
 *
 * 规格编号：C.2。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// A failed import: the error escapes the TS handler (C40-handler-errors), so only its first stderr line,
// which carries the message, is compared; the rest is a JavaScript stack trace.
import { defineCli } from "../../cli/run"
import { importFile, location } from "./fixture"

export default defineCli({
  args: ["session", "import", importFile],
  server: {
    routes: [location, { method: "POST", path: "/api/experimental/session/import", status: 500, json: {} }],
  },
  stderrLines: 1,
})
