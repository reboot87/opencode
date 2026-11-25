/**
 * PEM client certificate and private key, with the passphrase of an encrypted key.
 *
 * PEM 格式的客户端证书与私钥，encrypted key 需附带解密口令。
 */
export interface Tls {
  readonly cert: string
  readonly key: string
  readonly passphrase?: string
}

/**
 * The `fetch` and request options that present a client certificate on this runtime.
 *
 * 在当前运行时呈现客户端证书所需的 fetch 与请求选项。
 */
export interface Sender {
  readonly fetch: typeof globalThis.fetch
  readonly init: Record<string, unknown>
}
