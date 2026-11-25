/**
 * 对等性应用场景：文件·目录·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// A directory cannot be attached.
import { defineCli } from "../../cli/run"
import { server } from "./fixture"

export default defineCli({
  args: ["run", "hi", "-f", "sub"],
  files: { "sub/x": "x" },
  server: server(),
})
