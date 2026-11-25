/**
 * 浏览器测试 — PersistedConsumersTest。
 * 浏览器环境下的测试中负责 PersistedConsumersTest 部分，提供该部分所需的实现与类型定义。
 */
import { expect, test } from "bun:test"
import { createRoot } from "solid-js"
import { ModelSelectionSchema } from "@/providers/models/selection"
import { flushPersisted } from "@/runtime/persistence/persist"
import { persisted } from "@/runtime/persistence/storage"

test("persisted model selection hydrates, updates and serializes the schema shape", () => {
  const key = `consumer-model-selection-${crypto.randomUUID()}`
  localStorage.setItem(
    key,
    JSON.stringify({ pick: { session1: { agent: "plan" }, __workspace__: { agent: "build" } } }),
  )
  createRoot((dispose) => {
    try {
      const [state, setState] = persisted(
        key,
        ModelSelectionSchema,
        { session: {} },
        {
          platform: "web",
          openExternal: () => {},
          restart: async () => {},
          notify: async () => {},
        },
      )

      expect(state.session.session1?.agent).toBe("plan")
      const choice = { providerID: "provider", modelID: "model", variant: { type: "default" as const } }
      setState("session", "session1", { agent: "build", choice })
      expect(state.session.session1?.agent).toBe("build")
      flushPersisted()
      expect(JSON.parse(localStorage.getItem(key) ?? "null")).toEqual({
        session: { session1: { agent: "build", choice } },
      })
    } finally {
      dispose()
      localStorage.removeItem(key)
    }
  })
})
