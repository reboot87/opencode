/**
 * 对等性应用场景：添加·全局·CLI。
 *
 * 规格编号：C.6。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"

// `mcp add --global` writes the global config, not the project's.
export default defineCli({
  args: ["mcp", "add", "remote", "--global", "--url", "https://mcp.example.test/mcp"],
  files: { "../home/.config/opencode/opencode.jsonc": "{}\n" },
  collect: ["home/.config/opencode/opencode.jsonc", "work/opencode.json"],
})
