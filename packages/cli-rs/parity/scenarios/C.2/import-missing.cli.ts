/**
 * 对等性应用场景：导入·缺失·CLI。
 *
 * 规格编号：C.2。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// A file that does not exist: the read fails before the command connects. The error escapes the TS
// handler (C40-handler-errors); only the first stderr line is compared.
import { defineCli } from "../../cli/run"
import { location } from "./fixture"

export default defineCli({
  args: ["session", "import", "missing.json"],
  server: { routes: [location] },
  stderrLines: 1,
})
