/**
 * 对等性应用场景：权限·待处理·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// A request already pending when the prompt is admitted (the list after the prompt) is rejected too;
// `--yolo` is the hidden spelling of `--auto`.
import { defineCli } from "../../cli/run"
import { server, textStep } from "./fixture"

export default defineCli({
  args: ["run", "--yolo", "hello"],
  server: server({
    events: () => textStep("ok"),
    routes: [
      {
        path: "/api/session/ses_run/permission",
        json: { data: [{ id: "per_2", sessionID: "ses_run", action: "bash", resources: ["ls"] }] },
      },
      { method: "POST", path: "/api/session/ses_run/permission/per_2/reply", status: 204 },
    ],
  }),
})
