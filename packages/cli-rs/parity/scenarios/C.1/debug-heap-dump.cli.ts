/**
 * 对等性应用场景：debug·堆内存·转储·CLI。
 *
 * 规格编号：C.1。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `debug heap-dump --directory snaps/../out/`: the relative directory resolves against the working
// directory, and a server that wrote elsewhere (one released before `directory`) gets the warning.
import { defineCli } from "../../cli/run"

export default defineCli({
  args: ["debug", "heap-dump", "--directory", "snaps/../out/"],
  server: {
    routes: [
      {
        method: "POST",
        path: "/api/debug/heap-dump",
        json: {
          path: "/var/log/opencode/heap-1.heapsnapshot",
          pid: 42,
          memory: { rss: 1, heapTotal: 2, heapUsed: 3, external: 4, arrayBuffers: 5 },
        },
      },
    ],
  },
})
