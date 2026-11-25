/**
 * SDK 统一出口。
 * 集中导出 SDK 的公共入口与事件类型。
 */
export * as OpenCode from "./opencode"
export * as Tool from "./tool"

export { ClientError } from "@opencode/client"
export type { OpenCodeEvent } from "@opencode/client"
export * from "./contracts"
