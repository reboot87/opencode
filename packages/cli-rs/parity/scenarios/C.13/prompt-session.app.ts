/**
 * 对等性应用场景：提示词·会话·app。
 *
 * 规格编号：C.13。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `--session ses_b --prompt hello` (C01): the session opens with the text in its prompt and sends it.
import { defineApp, session, user } from "../../lib/app"
import { catalog, inbox } from "./catalog"

export default defineApp({
  args: { sessionID: "ses_b", prompt: "hello" },
  routes: [
    ...catalog,
    { path: "/api/session/ses_b", json: { data: session("ses_b", "Fix the parser", { updated: 2 }) } },
    { path: "/api/session/ses_b/message", json: { data: [user("msg_1", "Why?")], cursor: {} } },
    { path: "/api/session/ses_b/inbox", json: { data: [] } },
    { method: "POST", path: "/api/session/ses_b/agent" },
    { method: "POST", path: "/api/session/ses_b/prompt", json: { data: inbox("ses_b") } },
  ],
  steps: [{ checkpoint: "sent", until: "Demo Model" }],
})
