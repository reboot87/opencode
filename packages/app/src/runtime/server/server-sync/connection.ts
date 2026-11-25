/**
 * 服务端同步 — Connection。
 * 与服务端保持数据一致的同步机制中负责 Connection 部分，提供该部分所需的实现与类型定义。
 */
import { createEffect, onCleanup, untrack, type Accessor } from "solid-js"
import type { ServerConnectionStatus } from "../client"
import { transitionConnectionSync, type ConnectionSyncEvent, type ConnectionSyncState } from "./machine"

export function createConnectionSync(input: {
  status: Accessor<ServerConnectionStatus>
  invalidate: () => void
  connected: (info: { restart: boolean }) => void
}) {
  // Read only by `dispatch`; the effects run untracked, so their reads never re-run the status effect.
  let connection: ConnectionSyncState = { type: "idle" }

  function dispatch(event: ConnectionSyncEvent) {
    const result = transitionConnectionSync(connection, event)
    connection = result.state
    result.effects.forEach((effect) => {
      if (effect.type === "invalidate") return input.invalidate()
      input.connected({ restart: effect.restart })
    })
  }

  createEffect(() => {
    const status = input.status()
    untrack(() => dispatch({ type: "status.changed", status }))
  })
  onCleanup(() => dispatch({ type: "disposed" }))

  function handleEvent(event: { type: string }) {
    if (event.type !== "server.connected") return
    dispatch({ type: "handshake.received" })
  }

  return { handleEvent }
}
