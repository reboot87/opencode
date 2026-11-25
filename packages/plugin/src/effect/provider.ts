/**
 * Effect 风格插件 API — Provider 领域。
 * 插件对模型提供方记录的编辑能力。此文件定义 Effect 风格 下该领域的接口与类型，与其它领域共同构成插件 API 表面。
 */
import type { ProviderApi } from "@opencode/client/effect/api"
import type { Model } from "@opencode/schema/model"
import type { Provider } from "@opencode/schema/provider"
import type { ConnectionInfo } from "@opencode/client"
import type { Effect, Types } from "effect"
import type { Transform } from "./registration.js"

/** Provider metadata and immutable source definitions, including inactive providers. */
export interface ProviderRecord {
  readonly provider: Provider.Info
  readonly models: ReadonlyMap<string, Model.Info>
  readonly sourceConnection?: ConnectionInfo
}

export interface ProviderEditor {
  list(): readonly ProviderRecord[]
  get(providerID: string): ProviderRecord | undefined
  /** A discovered account-specific inventory can be bound to the connection that produced it. */
  add(input: { info: Provider.Info; models: readonly Model.Info[]; sourceConnection?: ConnectionInfo }): void
  update(providerID: string, update: (provider: Types.DeepMutable<Provider.Info>) => void): void
  remove(providerID: string): void
  readonly models: {
    set(providerID: string, models: readonly Model.Info[]): void
    /** Updates an owned copy of a source definition. */
    update(providerID: string, modelID: string, update: (model: Types.DeepMutable<Model.Info>) => void): void
    remove(providerID: string, modelID: string): void
  }
}

export interface ProviderDomain extends ProviderApi<unknown> {
  readonly transform: Transform<ProviderEditor>
  readonly reload: () => Effect.Effect<void>
}
