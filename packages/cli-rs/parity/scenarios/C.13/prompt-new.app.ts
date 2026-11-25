/**
 * 对等性应用场景：提示词·new·app。
 *
 * 规格编号：C.13。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `--prompt hello --session ses_new` where the server has no `ses_new` (C01): the home prompt shows the text,
// submits it once the catalogs load, and the session it creates takes the ID `ses_new`.
import { defineApp, session } from "../../lib/app"
import { catalog, inbox } from "./catalog"

export default defineApp({
  args: { prompt: "hello", newSessionID: "ses_new" },
  routes: [
    ...catalog,
    { method: "POST", path: "/api/session", json: { data: session("ses_new", "") } },
    { path: "/api/session/ses_new", json: { data: session("ses_new", "") } },
    { path: "/api/session/ses_new/message", json: { data: [], cursor: {} } },
    { path: "/api/session/ses_new/inbox", json: { data: [] } },
    { method: "POST", path: "/api/session/ses_new/prompt", json: { data: inbox("ses_new") } },
  ],
  steps: [{ checkpoint: "sent", until: "Demo Model" }],
})
