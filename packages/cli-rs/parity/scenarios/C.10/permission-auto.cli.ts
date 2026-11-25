/**
 * 对等性应用场景：权限·auto·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `--auto` approves the request once, without a warning line.
import { defineCli } from "../../cli/run"
import { server, textStep } from "./fixture"
import { ask } from "./permission.cli"

export default defineCli({
  args: ["run", "--auto", "hello"],
  server: server({
    events: () => [ask, ...textStep("Edited.")],
    routes: [{ method: "POST", path: "/api/session/ses_run/permission/per_1/reply", status: 204 }],
  }),
})
