/**
 * 对等性应用场景：问题·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// A question form is cancelled with a message, so the model continues; the run succeeds.
import { defineCli } from "../../cli/run"
import { event, server, textStep } from "./fixture"

export default defineCli({
  args: ["run", "hello"],
  server: server({
    events: () => [
      event(
        "form.created",
        { form: { id: "frm_1", sessionID: "ses_run", metadata: { kind: "question" }, fields: [] } },
        12,
      ),
      ...textStep("Assumed yes."),
    ],
    routes: [{ method: "DELETE", path: "/api/session/ses_run/form/frm_1", status: 204 }],
  }),
})
