/**
 * 对等性应用场景：导出·CLI。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { credentialRoute, sink } from "./fixture"

// `auth export`: every credential, as the server sent it. No warning without a terminal.
export default defineCli({
  args: ["auth", "export"],
  env: sink,
  server: { routes: [credentialRoute()] },
})
