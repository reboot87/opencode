/**
 * 对等性应用场景：auto·app。
 *
 * 规格编号：C.13。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `--auto` (C01): the home prompt's metadata row says `auto` after the agent.
import { defineApp, HOME_PLACEHOLDER } from "../../lib/app"
import { catalog } from "./catalog"

export default defineApp({
  args: { auto: true },
  routes: catalog,
  steps: [
    {
      checkpoint: "home",
      until: "Demo Model",
      masks: [HOME_PLACEHOLDER],
    },
  ],
})
