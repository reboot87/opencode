/**
 * Mini 精简界面 — StreamV2Image。
 * 精简交互模式（mini）的界面与交互中负责 StreamV2Image 部分，提供该部分所需的实现与类型定义。
 */
import type { SessionMessageAssistantTool, SessionMessageUser } from "@opencode/client/promise"
import { deduplicateVisibleImages } from "../prompt/attachment"
import { toolDisplayContent } from "../util/tool-display"
import type { StreamCommit } from "./types"

export type ImageCommit = StreamCommit & { image: string; messageID: string; partID: string }

export function userImageCommits(messageID: string, files: SessionMessageUser["files"]): ImageCommit[] {
  return deduplicateVisibleImages(files ?? [])
    .filter((file) => file.mime.startsWith("image/"))
    .map((file, index) => ({
      kind: "user",
      source: "system",
      text: file.name ?? file.mention?.text ?? `[Image ${index + 1}]`,
      image: `data:${file.mime};base64,${file.data}`,
      phase: "final",
      messageID,
      partID: `image:${index}`,
    }))
}

export function toolImageCommits(part: SessionMessageAssistantTool, messageID: string): ImageCommit[] {
  return toolDisplayContent(part.state)
    .flatMap((content) =>
      content.type === "file" && content.mime.startsWith("image/") && content.uri.startsWith("data:image/")
        ? [content]
        : [],
    )
    .map((content, index) => ({
      kind: "tool",
      source: "tool",
      text: content.name ?? `[Image ${index + 1}]`,
      image: content.uri,
      phase: "final",
      messageID,
      partID: `prt_${part.id}:image:${index}`,
    }))
}
