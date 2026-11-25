/**
 * Promise 风格插件 API — AI SDK 领域。
 * 插件对 AI SDK 请求/响应流程的干预钩子。此文件定义 Promise 风格 下该领域的接口与类型，与其它领域共同构成插件 API 表面。
 */
import type { LanguageModelV3 } from "@ai-sdk/provider"
import type { Model } from "@opencode/schema/model"
import type { ModelHooks } from "./registration.js"

export interface AISDKHooks {
  sdk: {
    readonly model: Model.Info
    readonly package: string
    readonly options: Record<string, any>
    sdk?: any
  }
  language: {
    readonly model: Model.Info
    readonly sdk: any
    readonly options: Record<string, any>
    language?: LanguageModelV3
  }
}

export interface AISDKDomain {
  readonly hook: ModelHooks<AISDKHooks>
}
