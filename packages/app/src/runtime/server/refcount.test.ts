/**
 * 运行时服务端连接 — RefcountTest。
 * 浏览器端与服务端的连接与同步中负责 RefcountTest 部分，提供该部分所需的实现与类型定义。
 */
import { expect, test } from "bun:test"
import { createRoot } from "solid-js"
import { createRefCountMap } from "./refcount"
import { pathKey } from "@/workspaces/path-key"

test.each([
  { name: "the same key", keys: ["/project", "/project"], normalize: undefined, removed: "/project" },
  { name: "equivalent paths", keys: ["C:\\repo", "C:/repo/"], normalize: pathKey, removed: "C:/repo" },
])("keeps an item for $name until its last owner is disposed", ({ keys, normalize, removed }) => {
  const calls: string[] = []

  const map = createRefCountMap(
    (key) => key,
    (key) => calls.push(key),
    normalize,
  )

  const [first, second] = keys.map((key) =>
    createRoot((dispose) => {
      map(key)

      return dispose
    }),
  )

  first!()
  expect(calls).toEqual([])
  second!()
  expect(calls).toEqual([removed])
})
