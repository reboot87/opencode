/**
 * ACP 能力声明。
 * 声明本实现支持的 ACP 能力与扩展方法（含子会话更新）。
 */
import type { ClientCapabilities } from "@agentclientprotocol/sdk"

export const ChildSessionUpdates = "opencode/child-session-updates"

export type Capabilities = ReturnType<typeof parse>

export function parse(client: ClientCapabilities | undefined) {
  const elicitation = client?.elicitation
  const compaction = client?.session?.compaction
  return {
    childSessionUpdates: client?._meta?.[ChildSessionUpdates] === true,
    formElicitation: elicitation?.form !== undefined && elicitation.form !== null,
    compaction: compaction !== undefined && compaction !== null,
  }
}

export * as ACPCapabilities from "./capabilities"
