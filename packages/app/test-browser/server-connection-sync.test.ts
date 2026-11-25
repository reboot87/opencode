/**
 * 浏览器测试 — ServerConnectionSyncTest。
 * 浏览器环境下的测试中负责 ServerConnectionSyncTest 部分，提供该部分所需的实现与类型定义。
 */
import { expect, test } from "bun:test"
import { createRoot, createSignal } from "solid-js"
import { createConnectionSync } from "@/runtime/server/server-sync/connection"

// Runs under the browser build: the server build of Solid never runs the invalidation effect.
test("invalidates disconnected data and synchronizes after each handshake", () => {
  const calls: string[] = []

  const root = createRoot((dispose) => {
    const [status, setStatus] = createSignal<"connecting" | "connected" | "reconnecting">("connecting")

    const connection = createConnectionSync({
      status,
      invalidate: () => calls.push("invalidate"),
      connected: (info) => calls.push(`connected:${info.restart}`),
    })

    return { connection, setStatus, dispose }
  })

  try {
    expect(calls).toEqual(["invalidate"])
    root.connection.handleEvent({ type: "server.connected" })
    root.setStatus("connected")
    expect(calls).toEqual(["invalidate", "connected:false"])

    root.setStatus("reconnecting")
    root.connection.handleEvent({ type: "server.connected" })
    root.setStatus("connected")
    expect(calls).toEqual(["invalidate", "connected:false", "invalidate", "connected:true"])
  } finally {
    root.dispose()
  }
})
