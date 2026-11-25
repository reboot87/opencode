/**
 * v1 旧版事件类型。
 * 兼容 v1 的事件结构（仅用于迁移）。
 */
export * as LegacyEventV1 from "./legacy-event.js"

import { Schema } from "effect"
import { ephemeral, inventory } from "../event.js"
import { SessionID } from "../session-id.js"
import { SessionV1 } from "./session.js"

export const CommandExecuted = ephemeral({
  type: "command.executed",
  schema: {
    name: Schema.String,
    sessionID: SessionID,
    arguments: Schema.String,
    messageID: SessionV1.MessageID,
  },
})

export const Definitions = inventory(CommandExecuted)
