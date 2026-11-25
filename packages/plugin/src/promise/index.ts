/**
 * Promise 风格插件 API 出口。
 * 集中导出 Promise 风格插件的各领域接口与类型。
 */
export type { PluginOptions } from "../options.js"
export type { StorageEntry, StorageScanOptions, StorageScanResult } from "../storage.js"
export * as Plugin from "./plugin.js"

export { Agent } from "@opencode/schema/agent"
export { Artifact } from "@opencode/schema/artifact"
export { Command } from "@opencode/schema/command"
export { Connection } from "@opencode/schema/connection"
export { Credential } from "@opencode/schema/credential"
export { Integration } from "@opencode/schema/integration"
export { Location } from "@opencode/schema/location"
export { Mcp } from "@opencode/schema/mcp"
export { Model } from "@opencode/schema/model"
export { PersistentPty } from "@opencode/schema/persistent-pty"
export { Provider } from "@opencode/schema/provider"
export { Reference } from "@opencode/schema/reference"
export { Rpc } from "@opencode/schema/rpc"
export { Skill } from "@opencode/schema/skill"
export { Vcs } from "@opencode/schema/vcs"
export { WebSearch } from "@opencode/schema/websearch"
export { Worktree } from "@opencode/schema/worktree"
