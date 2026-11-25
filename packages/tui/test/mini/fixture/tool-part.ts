/**
 * Mini 夹具 — ToolPart。
 * 精简交互模式的测试夹具中负责 ToolPart 部分，提供该部分所需的实现与类型定义。
 */
import type { SessionMessageAssistantTool } from "@opencode/client/promise"

export function canonicalToolPart(
  name: string,
  state: SessionMessageAssistantTool["state"],
  id = `${name}-1`,
): SessionMessageAssistantTool {
  return {
    type: "tool",
    id,
    name,
    state,
    time:
      state.status === "streaming"
        ? { created: 1 }
        : state.status === "completed" || state.status === "error"
          ? { created: 1, ran: 1, completed: 2 }
          : { created: 1, ran: 1 },
  }
}
