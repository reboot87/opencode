/**
 * 会话传输类型。
 * 定义会话导出/导入的数据结构。
 */
export * as SessionTransfer from "./session-transfer.js"

import { Schema } from "effect"
import { Session } from "./session.js"
import { SessionMessage } from "./session-message.js"

export interface Data extends Schema.Schema.Type<typeof Data> {}
export const Data = Schema.Struct({
  info: Session.Info,
  messages: Schema.Array(SessionMessage.Info),
}).annotate({ identifier: "SessionTransfer.Data" })
