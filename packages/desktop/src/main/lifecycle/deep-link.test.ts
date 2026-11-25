/**
 * 生命周期 — DeepLinkTest。
 * 桌面端窗口与应用的启动退出流程中负责 DeepLinkTest 部分，提供该部分所需的实现与类型定义。
 */
import { describe, expect, test } from "bun:test"
import { consoleReturnWindow } from "./deep-link"

describe("Console return deep links", () => {
  test("reads the originating Desktop window", () => {
    expect(consoleReturnWindow("opencode://console/authorized?window=window-a")).toBe("window-a")
    expect(consoleReturnWindow("opencode://console/authorized?window=window%20b")).toBe("window b")
  })

  test("rejects unrelated and malformed links", () => {
    expect(consoleReturnWindow("opencode://console/other?window=window-a")).toBeUndefined()
    expect(consoleReturnWindow("opencode://other/authorized?window=window-a")).toBeUndefined()
    expect(consoleReturnWindow("https://console/authorized?window=window-a")).toBeUndefined()
    expect(consoleReturnWindow("not a url")).toBeUndefined()
    expect(consoleReturnWindow("opencode://console/authorized")).toBeUndefined()
  })
})
