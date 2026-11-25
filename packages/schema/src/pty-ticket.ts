/**
 * PTY 票据类型。
 * 定义 PTY 会话票据的结构。
 */
export * as PtyTicket from "./pty-ticket.js"

import { Schema } from "effect"
import { PositiveInt } from "./schema.js"

export const ConnectToken = Schema.Struct({
  ticket: Schema.String,
  expires_in: PositiveInt,
}).annotate({ identifier: "PtyTicket.ConnectToken" })
export interface ConnectToken extends Schema.Schema.Type<typeof ConnectToken> {}
