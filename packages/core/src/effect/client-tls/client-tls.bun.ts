/**
 * 客户端 TLS（Bun）。
 * 在 Bun 运行时构造携带客户端证书的 fetch。
 */
import type { Sender, Tls } from "./client-tls.js"

// Bun's fetch takes the client certificate per request.
export function sender(tls: Tls): Sender | undefined {
  return { fetch: globalThis.fetch, init: { tls } }
}

export * as ClientTls from "./client-tls.bun.js"
