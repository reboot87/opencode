/**
 * 浏览器扩展 API — WorkerEventsTest。
 * 浏览器插件暴露给扩展的接口中负责 WorkerEventsTest 部分，提供该部分所需的实现与类型定义。
 */
import { expect, test } from "bun:test"
import { workerQueue } from "./worker-events"

test("a failed event gets one fresh wake before the next event, even if both attempts fail", async () => {
  const queue = workerQueue()
  const calls: string[] = []
  const gate = Promise.withResolvers<void>()

  const first = queue.enqueue(async (fresh) => {
    calls.push(fresh ? "retry" : "first")
    await gate.promise
    throw new Error("unregistered")
  })

  const next = queue.enqueue(async () => {
    calls.push("next")
  })

  gate.resolve()
  await expect(first).rejects.toThrow("unregistered")
  await next
  expect(calls).toEqual(["first", "retry", "next"])
})

test("forgetting a worker drops its queued events; a replacement installation never receives them", async () => {
  const queue = workerQueue()
  const calls: boolean[] = []
  await Promise.all([
    queue.enqueue(async (fresh) => {
      calls.push(fresh)
      queue.close()
      throw new Error("unloaded")
    }),
    queue.enqueue(async (fresh) => {
      calls.push(fresh)
    }),
  ])
  expect(calls).toEqual([false])
})
