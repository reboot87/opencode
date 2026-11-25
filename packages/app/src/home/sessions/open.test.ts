/**
 * 主页会话 — OpenTest。
 * 主页中会话列表的展示中负责 OpenTest 部分，提供该部分所需的实现与类型定义。
 */
import { expect, test } from "bun:test"
import { shouldOpenSessionInBackground } from "./open"

const click = { button: 0, mac: true, meta: false, ctrl: false, shift: false, alt: false }

test.each([
  { name: "a middle click", input: { ...click, button: 1 }, expected: true },
  { name: "a right click", input: { ...click, button: 2 }, expected: false },
  { name: "Cmd+click on macOS", input: { ...click, meta: true }, expected: true },
  { name: "Ctrl+click elsewhere", input: { ...click, mac: false, ctrl: true }, expected: true },
  { name: "Cmd+Shift+click on macOS", input: { ...click, meta: true, shift: true }, expected: false },
  { name: "Ctrl+Alt+click elsewhere", input: { ...click, mac: false, ctrl: true, alt: true }, expected: false },
  { name: "Meta+click outside macOS", input: { ...click, mac: false, meta: true }, expected: false },
])("$name opens in the background: $expected", ({ input, expected }) => {
  expect(shouldOpenSessionInBackground(input)).toBe(expected)
})
