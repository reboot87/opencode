/**
 * 对等性应用场景：登录·回答·Future·类型·文本·CLI。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { futureRoutes, sink } from "./fixture"

// `auth login --answer` for a field of a type this client does not know, answered with JSON that is not a
// selection: rejected before any write.
export default defineCli({
  args: ["auth", "login", "future", "--answer", 'region="west"'],
  env: sink,
  server: { routes: futureRoutes({}) },
})
