/**
 * 对等性应用场景：导入·declared·CLI。
 *
 * 规格编号：C.2。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// A declared error from the import (400 with a message): TS reads the raw response, so it fails with the status
// text, not the message. Only the first stderr line is compared; the rest is a JavaScript stack trace.
import { defineCli } from "../../cli/run"
import { importFile, location } from "./fixture"

export default defineCli({
  args: ["session", "import", importFile],
  server: {
    routes: [
      location,
      {
        method: "POST",
        path: "/api/experimental/session/import",
        status: 400,
        json: { _tag: "BadRequest", message: "Invalid session data" },
      },
    ],
  },
  stderrLines: 1,
})
