/**
 * 对等性应用场景：标准输入·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// Piped stdin follows the message words after a newline.
import { defineCli } from "../../cli/run"
import { server, textStep } from "./fixture"

export default defineCli({
  args: ["run", "summarize", "this file"],
  stdin: "line one\nline two\n",
  server: server({ events: () => textStep("Summary.") }),
})
