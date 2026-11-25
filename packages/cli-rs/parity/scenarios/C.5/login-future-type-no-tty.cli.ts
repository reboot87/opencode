/**
 * 对等性应用场景：登录·Future·类型·无·终端设备·CLI。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { futureRoutes, sink } from "./fixture"

// `auth login` without `--answer` for a field of a type this client does not know: it is prompted for like any
// field, which needs a terminal.
export default defineCli({
  args: ["auth", "login", "future"],
  env: sink,
  server: { routes: futureRoutes({ title: "Region" }) },
})
