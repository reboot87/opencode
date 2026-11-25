/**
 * 对等性应用场景：文件·大型·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// A file over 10 MiB cannot be attached.
import { defineCli } from "../../cli/run"
import { server } from "./fixture"

export default defineCli({
  args: ["run", "hi", "-f", "big.txt"],
  files: { "big.txt": "x".repeat(10 * 1024 * 1024 + 1) },
  server: server(),
})
