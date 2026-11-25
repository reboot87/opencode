/**
 * 对等性应用场景：非·promoted·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// The execution ends but the prompt never reaches the message list: "Prompt was not promoted", exit 1.
import { defineCli } from "../../cli/run"
import { server } from "./fixture"

export default defineCli({
  args: ["run", "hello"],
  server: server({ listed: false }),
})
