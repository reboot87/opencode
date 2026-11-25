/**
 * 模块 — Model。
 * 该目录下的功能模块中负责 Model 部分，提供该部分所需的实现与类型定义。
 */
import { Schema } from "effect"

export const WebSocketEventSchema = Schema.Union([
  Schema.Struct({
    direction: Schema.Literals(["client", "server"]),
    kind: Schema.tag("text"),
    body: Schema.String,
  }),
  Schema.Struct({
    direction: Schema.Literals(["client", "server"]),
    kind: Schema.tag("binary"),
    body: Schema.String,
    bodyEncoding: Schema.Literal("base64"),
  }),
])

export type WebSocketEvent = Schema.Schema.Type<typeof WebSocketEventSchema>

export const WebSocketInteractionSchema = Schema.Struct({
  transport: Schema.tag("websocket"),
  connection: Schema.optional(
    Schema.Struct({
      sequence: Schema.Number,
      url: Schema.String,
      protocols: Schema.Array(Schema.String),
      close: Schema.Struct({
        code: Schema.Number,
        reason: Schema.String,
      }),
    }),
  ),
  events: Schema.Array(WebSocketEventSchema),
})

export interface WebSocketInteraction extends Schema.Schema.Type<typeof WebSocketInteractionSchema> {}
