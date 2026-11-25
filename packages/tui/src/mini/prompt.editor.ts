/**
 * Mini 精简界面 — PromptEditor。
 * 精简交互模式（mini）的界面与交互中负责 PromptEditor 部分，提供该部分所需的实现与类型定义。
 */
import type { WidthMethod } from "@opentui/core"
import type { RunPromptPart } from "./types"
import { realignPromptMentions } from "../prompt/mention"
import { parseSlashHead } from "../prompt/parse"

type Mention = Extract<RunPromptPart, { type: "file" | "agent" | "skill" }>

export function resolveEditorSlashValue(text: string) {
  const head = parseSlashHead(text)
  if (!head || head.name.toLowerCase() !== "editor") {
    return text
  }

  return head.arguments
}

export function realignEditorPromptParts(
  content: string,
  parts: RunPromptPart[],
  widthMethod: WidthMethod,
): RunPromptPart[] {
  const matches = realignPromptMentions(
    content,
    parts.map((part) => {
      if (part.type !== "file" && part.type !== "agent" && part.type !== "skill") return
      return promptPartMention(part)
    }),
    widthMethod,
  )

  return parts.flatMap((part, index) => {
    if (part.type !== "file" && part.type !== "agent" && part.type !== "skill") return [part]
    const mention = promptPartMention(part)
    if (!mention?.text) return [part]
    const match = matches[index]
    return match ? [updatePromptPart(part, match.start, match.end, match.text)] : []
  })
}

function promptPartMention(part: Mention) {
  const source = part.type === "file" ? part.source?.text : part.source
  if (!source) return
  return { start: source.start, end: source.end, text: source.value }
}

function updatePromptPart(part: Mention, start: number, end: number, text: string): Mention {
  if (part.type === "agent" || part.type === "skill") {
    return {
      ...part,
      source: {
        start,
        end,
        value: text,
      },
    }
  }

  if (!part.source?.text) {
    return part
  }

  return {
    ...part,
    source: {
      ...part.source,
      text: {
        ...part.source.text,
        start,
        end,
        value: text,
      },
    },
  }
}
