/**
 * Location 事件类型。
 * 定义与工作位置相关的事件结构。
 */
export * as LocationEvent from "./location-event.js"

import { ephemeral, inventory } from "./event.js"

/** The location's cached services were shut down; clients must revalidate its reads. */
export const Shutdown = ephemeral({ type: "location.shutdown", schema: {} })

export const Definitions = inventory(Shutdown)
