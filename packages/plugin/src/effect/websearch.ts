/**
 * Effect 风格插件 API — 网络搜索领域。
 * 插件定义网络搜索 provider 与调用能力。此文件定义 Effect 风格 下该领域的接口与类型，与其它领域共同构成插件 API 表面。
 */
import type { WebSearch } from "@opencode/schema/websearch"
import type { WebSearchApi } from "@opencode/client/effect/api"
import type { Effect } from "effect"
import type { Transform } from "./registration.js"

export interface WebSearchDefinition {
  readonly id: string
  readonly name: string
  readonly execute: (input: WebSearch.ProviderInput) => Effect.Effect<readonly WebSearch.Result[], unknown>
}

export interface WebSearchDomain extends WebSearchApi<unknown> {
  readonly transform: Transform<WebSearchEditor>
  readonly reload: () => Effect.Effect<void>
}

export interface WebSearchEditor {
  add(definition: WebSearchDefinition): void
  readonly default: {
    get(): string | false | undefined
    set(selection: string | false): void
  }
}
