/**
 * Promise 风格插件 API — 事件领域。
 * 插件对会话事件流的订阅能力。此文件定义 Promise 风格 下该领域的接口与类型，与其它领域共同构成插件 API 表面。
 */
import type { OpenCodeEvent } from "@opencode/client"
import type { SelectedEvent, SubscribeOptions } from "@opencode/client/promise/api"

type EventType = Exclude<OpenCodeEvent["type"], "server.connected">

export interface EventDomain {
  readonly subscribe: <Type extends EventType = EventType>(
    options?: SubscribeOptions<Type>,
  ) => AsyncIterable<SelectedEvent<OpenCodeEvent, Type>>
}
