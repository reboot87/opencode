/**
 * 对等性应用场景：登录·快捷键·help·CLI。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"

// The hidden `login` shortcut has its own help, with `auth login`'s arguments and flags.
export default defineCli({ args: ["login", "--help"] })
