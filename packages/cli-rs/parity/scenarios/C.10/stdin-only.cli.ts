/**
 * 对等性应用场景：标准输入·仅·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// With no words, stdin alone is the message.
import { defineCli } from "../../cli/run"
import { server, textStep } from "./fixture"

export default defineCli({
  args: ["run"],
  stdin: "only stdin",
  server: server({ events: () => textStep("ok") }),
})
