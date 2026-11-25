/**
 * 对等性应用场景：导入·缺失·CLI。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { credentialRoute, sink } from "./fixture"

// `auth import` of a missing file.
export default defineCli({
  args: ["auth", "import", "missing.json"],
  env: sink,
  server: { routes: [credentialRoute()] },
})
