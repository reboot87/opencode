/**
 * 对等性应用场景：状态机·空值·CLI。
 *
 * 规格编号：C.9。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `machine list` with no machines, and `machine remove` of a name the server does not know.
import { defineCli } from "../../cli/run"
import { env, info, register, script } from "../C.8/fixture"

export default defineCli({
  args: [],
  command: script([
    ["machine", "list"],
    ["machine", "remove", "x"],
  ]),
  env,
  server: {
    version: false,
    routes: [
      info(["http://127.0.0.1:4096"]),
      { path: "/api/experimental/machine", json: { data: [] } },
      {
        method: "DELETE",
        path: "/api/experimental/machine/x",
        status: 404,
        json: { _tag: "MachineNotFoundError", machine: "x", message: 'No machine named "x".' },
      },
    ],
  },
  setup: register,
})
