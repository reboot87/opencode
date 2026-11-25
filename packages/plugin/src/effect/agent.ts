/**
 * Effect 风格插件 API — Agent 领域。
 * 插件对 agent 的编辑与查询能力。此文件定义 Effect 风格 下该领域的接口与类型，与其它领域共同构成插件 API 表面。
 */
import type { AgentApi } from "@opencode/client/effect/api"
import type { Agent } from "@opencode/schema/agent"
import type { Effect, Types } from "effect"
import type { Transform } from "./registration.js"

export interface AgentEditor {
  list(): readonly Types.DeepMutable<Agent.Info>[]
  get(id: string): Types.DeepMutable<Agent.Info> | undefined
  default(id: string | undefined): void
  update(id: string, update: (agent: Types.DeepMutable<Agent.Info>) => void): void
  remove(id: string): void
}

export interface AgentDomain extends AgentApi<unknown> {
  readonly transform: Transform<AgentEditor>
  readonly reload: () => Effect.Effect<void>
}
