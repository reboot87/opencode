/**
 * 兼容性的测试。
 *
 * 被测模块：@opencode/schema/compatibility
 *
 * 覆盖该模块的核心行为与边界条件。
 */
import { describe, expect, test } from "bun:test"
import { FileSystem } from "../src/filesystem.js"

describe("schema compatibility", () => {
  test("moved class schemas remain constructible", () => {
    const input = new FileSystem.FindInput({ query: "src" })
    expect(input).toBeInstanceOf(FileSystem.FindInput)
    expect(input.query).toBe("src")
  })
})
