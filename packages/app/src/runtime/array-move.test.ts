/**
 * 应用运行时 — ArrayMoveTest。
 * 浏览器端应用的运行时环境与服务装配中负责 ArrayMoveTest 部分，提供该部分所需的实现与类型定义。
 */
import { expect, test } from "bun:test"
import { arrayMove } from "./array-move"

test("moves an item forward and backward", () => {
  expect(arrayMove(["a", "b", "c", "d"], 0, 2)).toEqual(["b", "c", "a", "d"])
  expect(arrayMove(["a", "b", "c", "d"], 3, 1)).toEqual(["a", "d", "b", "c"])
  expect(arrayMove(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"])
})

test("does not mutate the input", () => {
  const items = ["a", "b", "c"]
  arrayMove(items, 0, 2)
  expect(items).toEqual(["a", "b", "c"])
})

test("returns the same array when nothing moves", () => {
  const items = ["a", "b"]
  expect(arrayMove(items, 1, 1)).toBe(items)
})
