/**
 * Effect 风格插件 API — 引用领域。
 * 插件对引用来源的编辑能力。此文件定义 Effect 风格 下该领域的接口与类型，与其它领域共同构成插件 API 表面。
 */
import type { ReferenceGitSource, ReferenceLocalSource } from "@opencode/client"
import type { ReferenceApi } from "@opencode/client/effect/api"
import type { Effect } from "effect"
import type { Transform } from "./registration.js"

export interface ReferenceEditor {
  add(name: string, source: ReferenceLocalSource | ReferenceGitSource): void
  remove(name: string): void
  list(): readonly (readonly [string, ReferenceLocalSource | ReferenceGitSource])[]
  get(name: string): ReferenceLocalSource | ReferenceGitSource | undefined
}

export interface ReferenceDomain extends ReferenceApi<unknown> {
  readonly transform: Transform<ReferenceEditor>
  readonly reload: () => Effect.Effect<void>
}
