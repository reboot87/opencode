/**
 * Promise 风格插件 API — 引用领域。
 * 插件对引用来源的编辑能力。此文件定义 Promise 风格 下该领域的接口与类型，与其它领域共同构成插件 API 表面。
 */
import type { ReferenceApi } from "@opencode/client/promise/api"
import type { ReferenceGitSource, ReferenceLocalSource } from "@opencode/client"
import type { Transform } from "./registration.js"

export interface ReferenceEditor {
  add(name: string, source: ReferenceLocalSource | ReferenceGitSource): void
  remove(name: string): void
  list(): readonly (readonly [string, ReferenceLocalSource | ReferenceGitSource])[]
  get(name: string): ReferenceLocalSource | ReferenceGitSource | undefined
}

export interface ReferenceDomain extends ReferenceApi {
  readonly transform: Transform<ReferenceEditor>
  readonly reload: () => Promise<void>
}
