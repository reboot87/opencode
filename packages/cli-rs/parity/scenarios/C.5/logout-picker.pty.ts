/**
 * 对等性应用场景：登出·选择器·伪终端。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `auth logout` on a terminal: the integrations with stored credentials, then the account picker.
import { definePty } from "../../pty/run"
import { credentialWrites, integrationRoutes, sink } from "./fixture"
import { down, enter, first, press } from "./keys"

export default definePty({
  args: ["auth", "logout"],
  env: sink,
  server: { routes: [...integrationRoutes(), ...credentialWrites] },
  steps: [
    first("Select integration", "integrations"),
    press(enter, "accounts", "Select OpenAI account to log out"),
    press(down, "moved"),
    press(enter, "done", "Done"),
  ],
  osc: [],
  exits: true,
  requests: true,
})
