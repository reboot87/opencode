/**
 * 对等性应用场景：模型·非法·app。
 *
 * 规格编号：E.1。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `--model` without a provider (T27): a warning toast on the home.
import { defineApp, HOME_PLACEHOLDER } from "../../lib/app"

// The home prompt's placeholder row: its example is random.
const prompt = [HOME_PLACEHOLDER]

export default defineApp({
  args: { model: "gpt-5" },
  steps: [{ checkpoint: "toast", until: "Invalid model format: gpt-5", masks: prompt }],
})
