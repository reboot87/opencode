/**
 * 对等性应用场景：debug·堆内存·转储·未授权·CLI。
 *
 * 规格编号：C.1。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `debug heap-dump` answered by a declared error (401): stderr has its message without the tag, as
// `errorMessage` prints it, and the exit is 1.
import { defineCli } from "../../cli/run"

export default defineCli({
  args: ["debug", "heap-dump"],
  server: {
    routes: [
      {
        method: "POST",
        path: "/api/debug/heap-dump",
        status: 401,
        json: { _tag: "UnauthorizedError", message: "Authentication required" },
      },
    ],
  },
})
