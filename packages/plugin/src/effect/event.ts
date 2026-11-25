/**
 * Effect 风格插件 API — 事件领域。
 * 插件对会话事件流的订阅能力。此文件定义 Effect 风格 下该领域的接口与类型，与其它领域共同构成插件 API 表面。
 */
import type { EventSubscribeInput, EventSubscribeOutput, SelectedEvent } from "@opencode/client/effect/api"
import type { Stream } from "effect"

type EventType = NonNullable<EventSubscribeInput["types"]>[number]

export interface EventDomain {
  readonly subscribe: <Type extends EventType = EventType>(input?: {
    readonly types?: ReadonlyArray<Type>
  }) => Stream.Stream<SelectedEvent<EventSubscribeOutput, Type>, unknown>
}
