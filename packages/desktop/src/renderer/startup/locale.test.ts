/**
 * 模块 — LocaleTest。
 * 该目录下的功能模块中负责 LocaleTest 部分，提供该部分所需的实现与类型定义。
 */
import { describe, expect, test } from "bun:test"
import { storedLocaleValue } from "./locale-value"

describe("desktop stored locale", () => {
  test("extracts the current locale field and ignores missing locale data", () => {
    expect(storedLocaleValue('{"locale":"fr"}')).toBe("fr")
    expect(storedLocaleValue('{"other":true,"locale" : "zht"}')).toBe("zht")
    expect(storedLocaleValue(null)).toBeUndefined()
    expect(storedLocaleValue("{}")).toBeUndefined()
  })
})
