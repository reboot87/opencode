/**
 * 轻提示 — DescriptionTest。
 * 短时非阻塞消息提示组件中负责 DescriptionTest 部分，提供该部分所需的实现与类型定义。
 */
import { describe, expect, test } from "bun:test"
import { boundToastDescription, toastDescriptionLimit } from "./description"

describe("toast description bound", () => {
  test("keeps ordinary descriptions and the options object", () => {
    const options = { title: "Failed", description: "Attachment exceeds the limit" }
    expect(boundToastDescription(options)).toBe(options)
    expect(boundToastDescription({ description: undefined })).toEqual({ description: undefined })
  })

  test("cuts a description that embeds a whole data URL", () => {
    const description = `Attachment exceeds the limit: data:text/plain;base64,${"Q".repeat(50 * 1024 * 1024)}`
    const bounded = boundToastDescription({ title: "Failed to send prompt", description })
    expect(bounded.description!.length).toBe(toastDescriptionLimit + 1)
    expect(bounded.description!.endsWith("…")).toBe(true)
    expect(bounded.description!.startsWith("Attachment exceeds the limit: data:text/plain;base64,")).toBe(true)
    expect(bounded.title).toBe("Failed to send prompt")
  })
})

