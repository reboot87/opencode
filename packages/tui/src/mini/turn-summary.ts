/**
 * Mini 精简界面 — TurnSummary。
 * 精简交互模式（mini）的界面与交互中负责 TurnSummary 部分，提供该部分所需的实现与类型定义。
 */
import type { StreamCommit } from "./types"

export function turnSummaryCommit(input: {
  agent: string
  model: string
  duration: string
  messageID?: string
}): StreamCommit {
  return {
    kind: "system",
    text: `${input.agent} · ${input.model} · ${input.duration}`,
    phase: "final",
    source: "system",
    summary: {
      agent: input.agent,
      model: input.model,
      duration: input.duration,
    },
    messageID: input.messageID,
  }
}
