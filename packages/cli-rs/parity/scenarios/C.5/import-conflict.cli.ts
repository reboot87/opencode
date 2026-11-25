/**
 * 对等性应用场景：导入·冲突·CLI。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { credentialRoute, exportFile, sink } from "./fixture"

// `auth import` when the server already has every credential (409).
export default defineCli({
  args: ["auth", "import", exportFile],
  env: sink,
  server: {
    routes: [
      credentialRoute([]),
      {
        method: "POST",
        path: "/api/credential",
        status: 409,
        json: { _tag: "ConflictError", message: "Credential already exists" },
      },
    ],
  },
})
