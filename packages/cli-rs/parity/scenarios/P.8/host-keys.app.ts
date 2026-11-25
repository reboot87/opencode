/**
 * 对等性应用场景：主机·密钥·app。
 *
 * 规格编号：P.8。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// CT-8, CT-19: with no plugin, the host's own keys as before the change that routes a JS plugin's declined key on: the
// composer types `r` and a space, and Enter sends the prompt.
import { defineApp } from "../../lib/app"
import { keysApp } from "./keys"

export default defineApp(keysApp)
