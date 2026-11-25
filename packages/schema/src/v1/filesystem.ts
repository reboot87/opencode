/**
 * v1 文件系统类型。
 * 兼容 v1 的文件系统结构（仅用于迁移）。
 */
export * as FileSystemV1 from "./filesystem.js"

import { Schema } from "effect"
import { ephemeral, inventory } from "../event.js"

const Edited = ephemeral({
  type: "file.edited",
  schema: { file: Schema.String },
})

export const Event = { Edited, Definitions: inventory(Edited) }
