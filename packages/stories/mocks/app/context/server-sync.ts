/**
 * 模块 — ServerSync。
 * 该目录下的功能模块中负责 ServerSync 部分，提供该部分所需的实现与类型定义。
 */
import type { IntegrationMethod } from "@opencode/client/promise"

type ProviderAuthMethod = Extract<IntegrationMethod, { type: "key" | "oauth" }>

const data = {
  provider: {
    all: new Map(),
    connected: [],
    default: {},
  },
  provider_auth: {} as Record<string, ProviderAuthMethod[]>,
  config: { disabled_providers: [] as string[] },
}

export function mockProviderAuth(provider: string, methods: ProviderAuthMethod[]) {
  const previous = data.provider_auth[provider]
  data.provider_auth[provider] = methods
  return () => {
    if (previous) {
      data.provider_auth[provider] = previous
      return
    }
    delete data.provider_auth[provider]
  }
}
