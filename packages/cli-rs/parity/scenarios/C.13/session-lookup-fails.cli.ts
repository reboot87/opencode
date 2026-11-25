/**
 * 对等性应用场景：会话·查找·fails·CLI。
 *
 * 规格编号：C.13。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `--session ses_x --server <url>` (C01): the root command looks the session up before the TUI starts; a
// failing lookup ends the command with the error and exit 1.
import { defineCli } from "../../cli/run"

export default defineCli({
  args: ["--session", "ses_x"],
  server: { routes: [{ path: "/api/session/ses_x", status: 500, json: { message: "boom" } }] },
})
