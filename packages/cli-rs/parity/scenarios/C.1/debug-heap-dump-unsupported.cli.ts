/**
 * 对等性应用场景：debug·堆内存·转储·不支持·CLI。
 *
 * 规格编号：C.1。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `debug heap-dump` against a server without the route (404): the update hint on stderr, exit 1.
import { defineCli } from "../../cli/run"

export default defineCli({
  args: ["debug", "heap-dump"],
  server: { routes: [] },
})
