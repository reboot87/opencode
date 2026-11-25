/**
 * 模块 — ClientError。
 * 该目录下的功能模块中负责 ClientError 部分，提供该部分所需的实现与类型定义。
 */
import { Schema } from "effect"

export class ClientError extends Schema.TaggedError<ClientError>()("ClientError", {
  cause: Schema.Defect(),
}) {}
