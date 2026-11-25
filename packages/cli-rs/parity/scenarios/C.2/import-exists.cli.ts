/**
 * 对等性应用场景：导入·exists·CLI。
 *
 * 规格编号：C.2。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// A 409 from the import: "Session already exists" on stderr, exit 0.
import { defineCli } from "../../cli/run"
import { importFile, location } from "./fixture"

export default defineCli({
  args: ["session", "import", importFile],
  server: {
    routes: [
      location,
      { method: "POST", path: "/api/experimental/session/import", status: 409, json: { _tag: "Conflict" } },
    ],
  },
})
