/**
 * 对等性应用场景：添加·两者皆是·CLI。
 *
 * 规格编号：C.6。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"

// `mcp add` with both a URL and a command fails.
// The TS error escapes with a stack trace; only its first line is compared (C40-handler-errors).
export default defineCli({
  stderrLines: 1,
  args: ["mcp", "add", "x", "--url", "https://a.test", "--", "node"],
  collect: ["work/opencode.json"],
})
