/**
 * 对等性应用场景：添加·远程·CLI。
 *
 * 规格编号：C.6。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { commented } from "./fixture"

// `mcp add --url` with headers edits the existing commented `.opencode/opencode.jsonc` and keeps its comments.
export default defineCli({
  args: [
    "mcp",
    "add",
    "docs",
    "--url",
    "https://mcp.example.test/mcp",
    "--header",
    "Authorization=Bearer x",
    "--header",
    "X-Team=core",
  ],
  files: { ".opencode/opencode.jsonc": commented },
  collect: ["work/.opencode/opencode.jsonc", "work/opencode.json"],
})
