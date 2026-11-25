/**
 * LSP 事件类型。
 * 定义语言服务器诊断等事件结构。
 */
export * as LspEvent from "./lsp-event.js"

import { Event } from "./event.js"

export const Updated = Event.ephemeral({ type: "lsp.updated", schema: {} })

export const Definitions = Event.inventory(Updated)
