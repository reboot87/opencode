/**
 * 对等性应用场景：添加·本地·CLI。
 *
 * 规格编号：C.6。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"

// `mcp add` with a command after `--` writes a local server into a new `opencode.json`.
export default defineCli({
  args: [
    "mcp",
    "add",
    "files",
    "--env",
    "ROOT=/srv",
    "--env",
    "MODE=ro",
    "--",
    "npx",
    "-y",
    "@acme/files",
    "--root",
    ".",
  ],
  collect: ["work/opencode.json"],
})
