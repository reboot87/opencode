/**
 * 对等性应用场景：添加·全局·干净·CLI。
 *
 * 规格编号：C.6。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"

// `mcp add --global` in a home without `~/.config/opencode`: the directory is created, as TS's
// `Global.Service` does, and the server goes into a new `opencode.json`.
export default defineCli({
  args: ["mcp", "add", "remote", "--global", "--url", "https://mcp.example.test/mcp"],
  collect: ["home/.config/opencode/opencode.json", "work/opencode.json"],
})
