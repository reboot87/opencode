/**
 * 客户端错误类型。
 * 定义客户端调用失败时的错误结构。
 */
import { Schema } from "effect"

export class ClientError extends Schema.TaggedError<ClientError>()("ClientError", {
  cause: Schema.Defect(),
}) {}
