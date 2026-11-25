/**
 * 对等性应用场景：文件·缺失·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// A missing file fails before anything is created, as a JSON error envelope with no session.
import { defineCli } from "../../cli/run"
import { nowMask, server } from "./fixture"

export default defineCli({
  args: ["run", "--format", "json", "hi", "-f", "nope.txt"],
  server: server(),
  masks: [nowMask],
})
