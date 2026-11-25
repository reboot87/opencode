/**
 * Provider 设置 — Accounts。
 * provider 的账号与密钥设置中负责 Accounts 部分，提供该部分所需的实现与类型定义。
 */
import type { ConnectionInfo, IntegrationInfo } from "@opencode/client/promise"

export type ProviderAccount = Extract<ConnectionInfo, { type: "credential" }>

export function providerAccounts(integration: IntegrationInfo | undefined) {
  return integration?.connections.filter((connection): connection is ProviderAccount => connection.type === "credential") ?? []
}

export function activeProviderAccount(integration: IntegrationInfo | undefined) {
  return providerAccounts(integration)[0]
}
