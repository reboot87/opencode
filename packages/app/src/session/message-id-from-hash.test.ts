/**
 * 会话界面 — MessageIdFromHashTest。
 * 会话主界面的视图与状态中负责 MessageIdFromHashTest 部分，提供该部分所需的实现与类型定义。
 */
import { expect, test } from "bun:test"
import { messageIdFromHash } from "./message-id-from-hash"

test.each([
  ["#message-abc123", "abc123"],
  ["message-42", "42"],
  ["#review-panel", undefined],
])("reads the message ID from %s", (hash, id) => {
  expect(messageIdFromHash(hash)).toBe(id)
})
