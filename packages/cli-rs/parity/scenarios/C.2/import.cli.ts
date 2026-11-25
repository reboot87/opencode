/**
 * 对等性应用场景：导入·CLI。
 *
 * 规格编号：C.2。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `session import <file> --directory sub/..`: the file's `location` is replaced in place by the
// resolved location, and the server's session ID is printed.
import { defineCli } from "../../cli/run"
import { importFile, location, session } from "./fixture"

export default defineCli({
  args: ["session", "import", importFile, "--directory", "sub/.."],
  server: {
    routes: [
      location,
      {
        method: "POST",
        path: "/api/experimental/session/import",
        json: { data: session("ses_eeeeeeee0005", "Imported", 2) },
      },
    ],
  },
})
