/**
 * 模块 — Model。
 * 该目录下的功能模块中负责 Model 部分，提供该部分所需的实现与类型定义。
 */
import { Schema } from "effect"

export const RequestSnapshotSchema = Schema.Struct({
  method: Schema.String,
  url: Schema.String,
  headers: Schema.Record(Schema.String, Schema.String),
  body: Schema.String,
})

export type { RequestSnapshot } from "../api.js"

export const ResponseSnapshotSchema = Schema.Struct({
  status: Schema.Number,
  headers: Schema.Record(Schema.String, Schema.String),
  body: Schema.String,
  bodyEncoding: Schema.optional(Schema.Literals(["text", "base64"])),
})

export interface ResponseSnapshot extends Schema.Schema.Type<typeof ResponseSnapshotSchema> {}

export const HttpInteractionSchema = Schema.Struct({
  transport: Schema.tag("http"),
  request: RequestSnapshotSchema,
  response: ResponseSnapshotSchema,
})

export interface HttpInteraction extends Schema.Schema.Type<typeof HttpInteractionSchema> {}

export * as HttpModel from "./model.js"
