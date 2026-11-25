/**
 * 对等性应用场景：会话·非法·标识·CLI。
 *
 * 规格编号：C.13。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `-s bad_id`: the session lookup gets a declared error (400); the command fails with its message
// without the tag, as `errorMessage` prints it.
import { defineCli } from "../../cli/run"

export default defineCli({
  args: ["-s", "bad_id"],
  server: {
    routes: [
      {
        path: "/api/session/bad_id",
        status: 400,
        json: { _tag: "InvalidRequestError", message: "Invalid session ID: bad_id" },
      },
    ],
  },
})
