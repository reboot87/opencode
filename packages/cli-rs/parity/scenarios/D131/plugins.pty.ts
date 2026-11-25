/**
 * 对等性应用场景：插件·伪终端。
 *
 * 规格编号：D131。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `/plugins` under the new designs, the only ones Rust draws (X02): the list fills `floor(rows / 2) - 6` rows and
// an overflowing list cuts off (#64934). A release starts with these designs (#64988; `designs.pty.ts`).
import { definePty } from "../../pty/run"
import { plugins } from "./plugins"

export default definePty(plugins({ experimental: { "new-designs": true } }))
