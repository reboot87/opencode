/**
 * 对等性应用场景：form·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// Any other form is cancelled and ends the run with exit code 1; the server says it is already settled.
import { defineCli } from "../../cli/run"
import { event, server, textStep } from "./fixture"

export default defineCli({
  args: ["run", "hello"],
  server: server({
    events: () => [
      event("form.created", { form: { id: "frm_2", sessionID: "ses_run", metadata: { kind: "mcp" }, fields: [] } }, 12),
      ...textStep("Stopped."),
    ],
    routes: [
      {
        method: "DELETE",
        path: "/api/session/ses_run/form/frm_2",
        status: 409,
        json: { _tag: "FormAlreadySettledError", message: "settled" },
      },
    ],
  }),
})
