/**
 * Claude 工具钩子。
 * 把待处理工具调用接入 Claude SDK 的 before 钩子。
 */
export * as ToolHooks from "./hooks.js"

import type { HookCallback, Options } from "@anthropic-ai/claude-agent-sdk"
import type { PendingTools } from "./pending.js"

export function make(pending: PendingTools.Interface): Options["hooks"] {
  const before: HookCallback = async (input) => {
    if (input.hook_event_name === "PreToolUse") pending.before(input.tool_use_id, input.tool_name)
    return {}
  }

  const after: HookCallback = async (input) => {
    if (input.hook_event_name !== "PostToolUse") return {}
    const replacement = pending.after(input.tool_use_id)
    if (!replacement) return {}
    return { hookSpecificOutput: { hookEventName: "PostToolUse", updatedMCPToolOutput: replacement } }
  }

  return {
    PreToolUse: [{ hooks: [before] }],
    PostToolUse: [{ hooks: [after] }],
  }
}
