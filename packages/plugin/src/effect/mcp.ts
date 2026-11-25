/**
 * Effect 风格插件 API — MCP 领域。
 * 插件对 MCP 服务器与工具的编辑能力。此文件定义 Effect 风格 下该领域的接口与类型，与其它领域共同构成插件 API 表面。
 */
import type { McpApi } from "@opencode/client/effect/api"
import type { Mcp } from "@opencode/schema/mcp"
import type { Effect, Types } from "effect"
import type { Transform } from "./registration.js"

export interface MCPEditor {
  list(): readonly [string, Types.DeepMutable<Mcp.ServerConfig>][]
  get(name: string): Types.DeepMutable<Mcp.ServerConfig> | undefined
  set(name: string, config: Mcp.ServerConfig): void
  update(name: string, update: (config: Types.DeepMutable<Mcp.ServerConfig>) => void): void
  remove(name: string): void
}

export interface MCPDomain extends Pick<McpApi<unknown>, "list"> {
  readonly transform: Transform<MCPEditor>
  readonly reload: () => Effect.Effect<void>
}
