/**
 * 对等性应用场景：get·密码·new·CLI。
 *
 * 规格编号：C.8。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `service get password` with no config creates a private 43-character credential and keeps it.
import { defineCli } from "../../cli/run"
import { command } from "../../cli/client"
import { env, quote } from "./fixture"

export default defineCli({
  args: [],
  command: (side) => {
    const get = command(side, ["service", "get", "password"]).map(quote).join(" ")
    // The password is random: compare its shape, and that the second read returns the same one.
    return ["sh", "-c", `{ ${get}; ${get}; } | uniq -c | sed -E 's/^ +//; s/ [A-Za-z0-9_-]{43}$/ <password>/'`]
  },
  env,
})
