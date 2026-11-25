/**
 * 对等性应用场景：工具·低·app。
 *
 * 规格编号：E.7a。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `tools.app.ts` at the default transcript verbosity (low, #63207): the finished tool calls fold into one
// summary row, even with `session.grouping: none`.
import base from "./tools.app"

export default {
  ...base,
  config: { session: { grouping: "none" } },
  steps: [{ checkpoint: "open", until: "1 command, 1 edit, 1 read" }],
}
