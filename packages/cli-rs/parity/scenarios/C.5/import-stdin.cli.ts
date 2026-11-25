/**
 * 对等性应用场景：导入·标准输入·CLI。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { credentialRoute } from "./fixture"

// `auth import` without a file reads the export from stdin.
export default defineCli({
  args: ["auth", "import"],
  stdin: JSON.stringify([
    { id: "cred_ffffffff0006", integrationID: "acme", label: "Piped", active: false, value: { type: "key", key: "k" } },
  ]),
  server: { routes: [credentialRoute([]), { method: "POST", path: "/api/credential", json: { data: {} } }] },
})
