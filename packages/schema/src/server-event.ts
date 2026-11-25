/**
 * 服务端事件类型。
 * 定义服务端向客户端推送的事件结构。
 */
export * as ServerEvent from "./server-event.js"

import { Event } from "./event.js"

export const Connected = Event.ephemeral({ type: "server.connected", schema: {} })
export const Disposed = Event.ephemeral({ type: "global.disposed", schema: {} })

export const Definitions = Event.inventory(Connected, Disposed)
