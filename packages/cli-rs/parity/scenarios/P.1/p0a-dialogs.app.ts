/**
 * 对等性应用场景：P0-A·弹窗·app。
 *
 * 规格编号：P.1。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// A plugin's confirm and alert, and its styled box (rich plugins P0a, ABI 1.5): the box sits in home.footer, F6 asks
// a confirm whose answer toasts, enter confirming and escape cancelling, and F7 shows an alert that toasts once escape
// closes it. TS loads the plugin from
// parity/plugins/p0a as a local plugin; Rust registers its twin when OPENCODE_PARITY_PLUGIN is `p0a`.
import { defineApp } from "../../lib/app"

// The composer's placeholder example is random in TS and Rust. A dialog covers it but for "Ask".
const placeholder = { x: 16, y: 14, width: 84, height: 1, reason: "the placeholder example: random in TS and Rust" }
// TS shows "Finishing startup…" for three seconds once loading the local TSX plugin took over half a second
// (`component/startup-loading.tsx`); Rust loads no TS plugin (F16).
const startup = { x: 39, y: 28, width: 22, height: 1, reason: "TS plugin loading notice (F16)" }

export default defineApp({
  config: { plugins: ["./plugins/p0a"] },
  env: { OPENCODE_PARITY_PLUGIN: "p0a" },
  steps: [
    { checkpoint: "home", until: "p0a", masks: [placeholder, startup] },
    { keys: ["f6"] },
    { checkpoint: "confirm", until: "Delete the draft?", masks: [startup] },
    { keys: ["return"] },
    { checkpoint: "confirmed", until: "answered true", masks: [placeholder, startup] },
    { keys: ["f7"] },
    { checkpoint: "alert", until: "Heads up", masks: [startup] },
    { keys: ["escape"] },
    { checkpoint: "alerted", until: "alert closed", masks: [placeholder, startup] },
    { keys: ["f6"] },
    { keys: ["escape"] },
    { checkpoint: "cancelled", until: "answered false", masks: [placeholder, startup] },
  ],
})
