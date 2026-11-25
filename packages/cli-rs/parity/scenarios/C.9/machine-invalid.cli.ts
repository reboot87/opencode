/**
 * 对等性应用场景：状态机·非法·CLI。
 *
 * 规格编号：C.9。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `machine add` with a name the server rejects (400 `invalid_name`), and another 400 that keeps the server's message.
import { defineCli } from "../../cli/run"
import type { Logged } from "../../lib/fake-server"
import { env, info, register, script } from "../C.8/fixture"

export default defineCli({
  args: [],
  command: script([
    ["machine", "add", "Bad"],
    ["machine", "add", "other"],
  ]),
  env,
  server: {
    version: false,
    routes: [
      info(["http://127.0.0.1:4096"]),
      {
        method: "POST",
        path: "/api/experimental/machine",
        status: 400,
        json: (entry: Logged) =>
          (entry.body as { name: string }).name === "Bad"
            ? { _tag: "InvalidRequestError", kind: "invalid_name", message: "invalid machine name" }
            : { _tag: "InvalidRequestError", message: "reach is empty" },
      },
    ],
  },
  setup: register,
})
