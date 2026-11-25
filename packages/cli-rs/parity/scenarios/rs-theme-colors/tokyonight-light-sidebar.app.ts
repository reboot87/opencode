/**
 * 对等性应用场景：Tokyo Night·浅色·侧边栏·app。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import base from "../E.14/sidebar.app"
import { themed } from "./themed"

// The reply can land after the sidebar card, so the first checkpoint waits for the reply.
const scenario = themed(base, "tokyonight", "light")
export default {
  ...scenario,
  steps: scenario.steps.map((step) =>
    "checkpoint" in step && step.checkpoint === "docked" ? { ...step, until: "The release plan is ready." } : step,
  ),
}
