/**
 * provider 错误码提取工具。
 *
 * 各家 provider 的错误响应体结构不同（error.code / error.innererror / error.type / AWS 的 __type 等），
 * providerCodes 递归扫描这些字段，提取出错误码列表（第一个作为主错误码）。
 * 被 provider-error.ts 用于错误分类。
 */
import { Option, Schema } from "effect"
import { Json } from "./json.js"
import { isRecord } from "./record.js"

const decodeJson = Schema.decodeUnknownOption(Json)

/** 从 provider 错误体里提取错误码（保留原始大小写）；第一个是主错误码（对应 AIError.code）。 */
export function providerCodes(value: unknown) {
  const decoded = typeof value === "string" ? Option.getOrUndefined(decodeJson(value)) : value
  if (!isRecord(decoded)) return []
  const error = isRecord(decoded.error) ? decoded.error : undefined
  const inner = error && isRecord(error.innererror) ? error.innererror : undefined
  const metadata = error && isRecord(error.metadata) ? error.metadata : undefined
  const response = isRecord(decoded.response) ? decoded.response : undefined
  const responseError = response && isRecord(response.error) ? response.error : undefined
  const exception = isRecord(decoded.exception) ? decoded.exception : undefined
  return [
    decoded.code,
    ...awsErrorType(decoded.__type),
    ...awsErrorType(decoded.code),
    decoded.error_type,
    error?.code,
    error?.type,
    error?.status,
    error?.error_type,
    // Google `google.rpc.ErrorInfo` details carry the specific reason.
    ...(Array.isArray(error?.details)
      ? error.details.map((detail) => (isRecord(detail) ? detail.reason : undefined))
      : []),
    inner?.code,
    metadata?.error_type,
    responseError?.code,
    response?.error_type,
    exception?.type,
  ].filter((value): value is string => typeof value === "string")
}

// AWS restJson1 reports the modeled error in `X-Amzn-Errortype`, `__type` or `code`, possibly
// namespaced (`ns#Name`) or suffixed (`Name:uri`). Keep the shape name only.
// https://smithy.io/2.0/aws/protocols/aws-restjson1-protocol.html#operation-error-serialization
export function awsErrorType(value: unknown) {
  return typeof value === "string" ? [value.replace(/:.*/s, "").replace(/^[^#]*#/, "")] : []
}
