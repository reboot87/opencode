/**
 * Promise 风格插件 API — 网络搜索领域。
 * 插件定义网络搜索 provider 与调用能力。此文件定义 Promise 风格 下该领域的接口与类型，与其它领域共同构成插件 API 表面。
 */
import type { WebSearch } from "@opencode/schema/websearch"
import type { WebSearchApi } from "@opencode/client/promise/api"
import type { Transform } from "./registration.js"

export interface WebSearchDefinition {
  readonly id: string
  readonly name: string
  readonly execute: (
    input: WebSearch.ProviderInput,
    context: { readonly signal: AbortSignal },
  ) => Promise<readonly WebSearch.Result[]>
}

export interface WebSearchDomain extends WebSearchApi {
  readonly transform: Transform<WebSearchEditor>
  readonly reload: () => Promise<void>
}

export interface WebSearchEditor {
  add(definition: WebSearchDefinition): void
  readonly default: {
    get(): string | false | undefined
    set(selection: string | false): void
  }
}
