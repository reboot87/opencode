/**
 * Promise 客户端错误类型。
 * 定义 Promise 风格客户端的错误原因与错误类。
 */
export type ClientErrorReason =
  | "Transport"
  | "UnexpectedStatus"
  | "UnsupportedContentType"
  | "MalformedResponse"
  | "SseEventTooLarge"

export class ClientError extends Error {
  override readonly name = "ClientError"
  constructor(
    readonly reason: ClientErrorReason,
    options?: ErrorOptions & { readonly detail?: string | null },
  ) {
    const detail = options?.detail ?? (options?.cause instanceof Error ? options.cause.message : undefined)
    super(detail ? `${reason}: ${detail}` : reason, options)
  }
}
