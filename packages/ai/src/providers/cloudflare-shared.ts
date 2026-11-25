/**
 * Cloudflare provider 共享配置工具。
 * 抽取 Cloudflare Workers AI 与 AI Gateway 共用的端点、鉴权与选项归一化逻辑。
 */
import { Endpoint } from "../route/endpoint.js"
import { ProviderConfigurationError, type ProviderID } from "../schema/index.js"

type AccountURL = { readonly accountId?: string; readonly baseURL?: string }

export const requireAccountId = (input: AccountURL, provider: ProviderID, name: string) => {
  if (input.accountId) return input.accountId
  throw new ProviderConfigurationError({
    provider,
    message: `${name}.configure requires accountId unless baseURL is supplied`,
  })
}

export const baseURL = (input: AccountURL, provider: ProviderID, name: string) => {
  if (input.baseURL) return input.baseURL
  return `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(requireAccountId(input, provider, name))}/ai/v1`
}

export const runBaseURL = (input: AccountURL, provider: ProviderID, name: string) => {
  const url = Endpoint.trimBaseUrl(baseURL(input, provider, name))
  if (!url.endsWith("/ai/v1"))
    throw new ProviderConfigurationError({
      provider,
      message: `${name} needs accountId or a baseURL ending in /ai/v1 to derive the Run API base`,
    })
  return `${url.slice(0, -"/v1".length)}/run`
}

export * as CloudflareShared from "./cloudflare-shared.js"
