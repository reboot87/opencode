/**
 * 对等性应用场景：列表·CLI。
 *
 * 规格编号：C.2。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `session list` with stdout piped: no pager; tabs and newlines in titles become spaces, a missing
// title is "Untitled session", and the project comes from the location of the working directory.
import { defineCli } from "../../cli/run"
import { list, location, sessions } from "./fixture"

export default defineCli({ args: ["session", "list"], server: { routes: [location, list(sessions)] } })
