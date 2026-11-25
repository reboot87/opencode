/**
 * JSON 工具。
 * 提供 JSON 字符串的 Schema 与同步编解码便捷函数，供协议层与工具层复用。
 */
import { Schema } from "effect"

/** JSON 字符串的 Schema：把字符串解析成未知 JSON 值。 */
export const Json = Schema.fromJsonString(Schema.Unknown)
/** 同步解码 JSON 字符串的便捷函数（解析失败抛错）。 */
export const decodeJson = Schema.decodeUnknownSync(Json)
export const encodeJson = Schema.encodeSync(Json)
