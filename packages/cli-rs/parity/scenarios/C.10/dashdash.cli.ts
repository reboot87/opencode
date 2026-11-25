/**
 * 对等性应用场景：dashdash·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// Words after `--` are message words, not flags.
import { defineCli } from "../../cli/run"
import { server, textStep } from "./fixture"

export default defineCli({
  args: ["run", "a", "--server", "$SERVER", "--", "--model", "x", "-c"],
  server: server({ events: () => textStep("ok") }),
})
