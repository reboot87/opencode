/**
 * 对等性应用场景：列表·空值·CLI。
 *
 * 规格编号：C.2。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `session list` with no sessions prints nothing; `--format json` prints `[]`.
import { defineCli } from "../../cli/run"
import { list, location } from "./fixture"

export default defineCli({ args: ["session", "list"], server: { routes: [location, list([])] } })
