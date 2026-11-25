/**
 * VCS 事件类型。
 * 定义版本控制相关事件结构。
 */
export * as VcsEvent from "./vcs-event.js"

import { Schema } from "effect"
import { optional } from "./schema.js"
import { Event } from "./event.js"

export const BranchUpdated = Event.ephemeral({
  type: "vcs.branch.updated",
  schema: {
    branch: optional(Schema.String),
  },
})

export const Definitions = Event.inventory(BranchUpdated)
