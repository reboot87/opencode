/**
 * 对等性应用场景：对账·JSON·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// As `reconcile`, in JSON: step_start, text, tool_use and step_finish built from the projected message.
import { defineCli } from "../../cli/run"
import { assistant, server } from "./fixture"
import { content } from "./reconcile.cli"

export default defineCli({
  args: ["run", "--format", "json", "--thinking", "hello"],
  server: server({ messages: [assistant(content, { snapshot: { start: "s1", end: "s2" } })] }),
})
