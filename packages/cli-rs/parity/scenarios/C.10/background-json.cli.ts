/**
 * 对等性应用场景：后台·JSON·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `background` with `--format json`: a `background_wait` event lists the jobs.
import { defineCli } from "../../cli/run"
import { nowMask, server, textStep } from "./fixture"
import { job, jobs, old, waitingJson, woken } from "./background.cli"

export default defineCli({
  args: ["run", "--format", "json", "hello"],
  server: server({
    events: () => textStep("Started the job."),
    routes: [jobs((count) => (count === 1 ? [old, job] : [old]))],
  }),
  late: { after: waitingJson, events: woken },
  masks: [nowMask],
})
