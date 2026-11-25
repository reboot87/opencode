/**
 * 对等性应用场景：列表·错误·CLI。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { sink } from "./fixture"

// `auth list` when the server fails: the bare message, exit 1.
export default defineCli({
  args: ["auth", "list"],
  env: sink,
  server: {
    routes: [
      {
        path: "/api/model/default",
        status: 503,
        json: { _tag: "ServiceUnavailableError", message: "The location is restarting" },
      },
    ],
  },
})
