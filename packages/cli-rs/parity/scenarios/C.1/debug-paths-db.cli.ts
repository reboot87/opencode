/**
 * 对等性应用场景：debug·路径·db·CLI。
 *
 * 规格编号：C.1。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `debug paths db` with a relative `OPENCODE_DB`, which resolves against the data directory.
import { defineCli } from "../../cli/run"

export default defineCli({
  args: ["debug", "paths", "db"],
  env: { OPENCODE_DB: "../custom/./my.db" },
})
