/**
 * 对等性应用场景：添加·替换·CLI。
 *
 * 规格编号：C.6。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { commented } from "./fixture"

// `mcp add` over an existing name replaces that server in place.
export default defineCli({
  args: ["mcp", "add", "existing", "--url", "https://mcp.example.test/"],
  files: { "opencode.json": commented },
  collect: ["work/opencode.json"],
})
