/**
 * 输入编辑器 — InteractionTest。
 * 输入区文本编辑器的实现中负责 InteractionTest 部分，提供该部分所需的实现与类型定义。
 */
import { expect, test } from "bun:test"
import { shouldHandlePasteAsAttachment } from "./interaction"

test("handles clipboard files, and native images only when the clipboard has no text", () => {
  expect(shouldHandlePasteAsAttachment(clipboard(), false)).toBe(false)
  expect(shouldHandlePasteAsAttachment(clipboard(), true)).toBe(true)
  expect(shouldHandlePasteAsAttachment(clipboard(["text/plain"]), true)).toBe(false)
  expect(shouldHandlePasteAsAttachment(clipboard([], [{ kind: "file" }]), false)).toBe(true)
})

function clipboard(types: string[] = [], items: Array<{ kind: string }> = []) {
  return { types, items } as unknown as DataTransfer
}
