/**
 * 对等性应用场景：导入·非法·CLI。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { credentialRoute } from "./fixture"

// An export that does not decode fails before the command connects.
export default defineCli({
  args: ["auth", "import"],
  stdin: JSON.stringify([
    { id: "cred_ffffffff0006", integrationID: "acme", label: "Bad", active: "yes", value: { type: "key" } },
  ]),
  server: { routes: [credentialRoute([])] },
})
