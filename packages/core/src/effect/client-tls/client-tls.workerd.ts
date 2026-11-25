/**
 * 客户端 TLS（Workerd）。
 * 在 workerd 运行时提供不可用占位实现。
 */
import type { Sender, Tls } from "./client-tls.js"

// Workers' fetch can't present a client certificate. Embedders use an mTLS certificate binding's fetch instead.
export function sender(_tls: Tls): Sender | undefined {
  return undefined
}

export * as ClientTls from "./client-tls.workerd.js"
