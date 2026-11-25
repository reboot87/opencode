/**
 * Promise 客户端出口。
 * 集中导出 Promise 风格客户端的公共 API。
 */
import type { OpenCode } from "./client.js"

export * from "./generated/index.js"
export { OpenCode } from "./client.js"
export { mediaHashFromUri, withMediaRefs, type MediaRequestOptions } from "./media.js"
export type {
  AgentApi,
  CommandApi,
  ConfigApi,
  EventApi,
  IntegrationApi,
  ModelApi,
  PluginApi,
  ProviderApi,
  ReferenceApi,
  RpcApi,
  RpcCallOptions,
  RpcClient,
  RpcEventPayload,
  WebSearchApi,
  SessionApi,
  SkillApi,
} from "./api.js"
export type { EventSubscribeOutput as OpenCodeEvent } from "./generated/types.js"
export type {
  MediaFileAttachment as PromptMediaFileAttachment,
  Attachment as PromptAttachment,
} from "@opencode/schema/prompt"
export type OpenCodeClient = ReturnType<typeof OpenCode.make>
