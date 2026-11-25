/**
 * 对等性应用场景：重试·JSON·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `retry` with `--format json`: a `retry` event, and one `step_start`.
import { defineCli } from "../../cli/run"
import { server, textStep } from "./fixture"
import { retry } from "./retry.cli"

export default defineCli({
  args: ["run", "--format", "json", "hello"],
  server: server({ events: () => [textStep("ignored")[0], retry, ...textStep("Recovered.")] }),
})
