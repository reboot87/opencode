/**
 * 安装事件类型。
 * 定义安装/卸载相关的事件结构。
 */
export * as InstallationEvent from "./installation-event.js"

import { Schema } from "effect"
import { Event } from "./event.js"

export const Updated = Event.ephemeral({
  type: "installation.updated",
  schema: {
    version: Schema.String,
  },
})

export const UpdateAvailable = Event.ephemeral({
  type: "installation.update-available",
  schema: {
    version: Schema.String,
  },
})

export const Definitions = Event.inventory(Updated, UpdateAvailable)
