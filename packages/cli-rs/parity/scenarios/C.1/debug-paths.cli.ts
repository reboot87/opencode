/**
 * 对等性应用场景：debug·路径·CLI。
 *
 * 规格编号：C.1。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `debug paths`: every global path from the sandbox's XDG roots. The database name depends on the
// channel, which TS embeds at build time (`local` from source) and Rust reads at run time; turning
// channel databases off makes both `opencode.db` (deviation C09-db-channel).
import { defineCli } from "../../cli/run"

export default defineCli({
  args: ["debug", "paths"],
  env: { OPENCODE_DISABLE_CHANNEL_DB: "1" },
})
