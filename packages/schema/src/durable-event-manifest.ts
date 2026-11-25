/**
 * 持久事件清单。
 * 声明事件的持久化语义（是否持久、是否可重放）。
 */
export * as DurableEventManifest from "./durable-event-manifest.js"

import { Event } from "./event.js"
import { Worktree } from "./worktree.js"
import { SessionEvent } from "./session-event.js"

export const Durable = Event.durableMap([...SessionEvent.DurableDefinitions, Worktree.Event.Resolved])
