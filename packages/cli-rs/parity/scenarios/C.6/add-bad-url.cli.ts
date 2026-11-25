/**
 * 对等性应用场景：添加·糟糕·URL·CLI。
 *
 * 规格编号：C.6。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"

// `mcp add` with a URL that does not parse fails.
// The TS error escapes with a stack trace; only its first line is compared (C40-handler-errors).
export default defineCli({
  stderrLines: 1,
  args: ["mcp", "add", "x", "--url", "not a url"],
  collect: ["work/opencode.json"],
})
