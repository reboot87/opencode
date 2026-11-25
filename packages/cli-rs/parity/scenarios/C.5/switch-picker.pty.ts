/**
 * 对等性应用场景：switch·选择器·伪终端。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `auth switch` on a terminal: typing filters the integrations, then the only account is chosen.
import { definePty } from "../../pty/run"
import { credentialWrites, integrationRoutes, sink } from "./fixture"
import { enter, first, press } from "./keys"

export default definePty({
  args: ["auth", "switch"],
  env: sink,
  server: { routes: [...integrationRoutes(), ...credentialWrites] },
  steps: [
    first("Select integration", "integrations"),
    press("git", "filtered"),
    press(enter, "accounts", "Select github account to switch to"),
    press(enter, "done", "Done"),
  ],
  osc: [],
  exits: true,
  requests: true,
})
