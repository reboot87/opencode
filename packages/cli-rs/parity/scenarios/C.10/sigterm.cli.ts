/**
 * 对等性应用场景：SIGTERM·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// An open, silent stdin (spawn's default stdio) does not hold the run once a message is given, and SIGTERM
// interrupts the session and exits with 143.
import { defineCli } from "../../cli/run"
import sigint from "./sigint.cli"

export default defineCli({
  ...sigint,
  stdinOpen: true,
  signal: { after: "/api/experimental/session/ses_run/wait", name: "SIGTERM" },
})
