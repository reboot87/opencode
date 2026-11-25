/**
 * 会话 ID 类型。
 * 定义会话的品牌 ID 类型。
 */
import { Schema } from "effect"
import { descending } from "./identifier.js"
import { statics } from "./schema.js"

export const SessionID = Schema.String.check(Schema.isStartingWith("ses")).pipe(
  Schema.brand("SessionID"),
  Schema.annotate({ identifier: "Session.ID" }),
  statics((schema) => ({
    create: () => schema.make("ses_" + descending()),
  })),
)
export type SessionID = typeof SessionID.Type
