/**
 * 对等性应用场景：登录·Future·类型·隐藏·文本·CLI。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { futureRoutes, sink } from "./fixture"

// A hidden field of a type this client does not know whose default is not a selection: rejected before any
// write.
export default defineCli({
  args: ["auth", "login", "future"],
  env: sink,
  server: { routes: futureRoutes({ hidden: true, default: "west" }) },
})
