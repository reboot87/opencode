/**
 * 对等性应用场景：通道·本地·伪终端。
 *
 * 规格编号：E.18a。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// T08: Rust on the `local` channel draws the DevTools bar the TS CLI from source draws (see `channel.pty.ts`).
import { definePty } from "../../pty/run"
import { home } from "./channel.pty"

export default definePty({
  ...home,
  env: {
    OPENCODE_CLI_CONFIG_CONTENT: JSON.stringify({ experimental: { "new-designs": true } }),
    OPENCODE_CHANNEL: "local",
  },
})
