/**
 * Promise 风格插件 API — Worktree 领域。
 * 插件对工作树的定义与编辑能力。此文件定义 Promise 风格 下该领域的接口与类型，与其它领域共同构成插件 API 表面。
 */
import type { WorktreeApi } from "@opencode/client/promise/api"
import type { WorktreeCreateInput, WorktreeEntry, WorktreeRemoveInput, WorktreeResult } from "../worktree.js"
import type { Transform } from "./registration.js"

export interface WorktreeDefinition {
  readonly id: string
  readonly create: (input: WorktreeCreateInput, context: { readonly signal: AbortSignal }) => Promise<WorktreeResult>
  readonly remove: (input: WorktreeRemoveInput, context: { readonly signal: AbortSignal }) => Promise<void>
  readonly list: (
    sourceDirectory: string,
    context: { readonly signal: AbortSignal },
  ) => Promise<readonly WorktreeEntry[]>
}

export interface WorktreeEditor {
  /** Registers an implementation and selects it as the default. Later active registrations win. */
  add(definition: WorktreeDefinition): void
}

export interface WorktreeDomain extends WorktreeApi {
  readonly transform: Transform<WorktreeEditor>
  readonly reload: () => Promise<void>
}
