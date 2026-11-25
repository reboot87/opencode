/**
 * 功能插件测试 — HomeFooterTest。
 * 终端功能插件的测试中负责 HomeFooterTest 部分，提供该部分所需的实现与类型定义。
 */
import { describe, expect, test } from "bun:test"
import { homeFooterVisibility } from "../../src/feature-plugins/home/footer"

describe("home footer visibility", () => {
  test("keeps failure labels readable at the minimum supported width", () => {
    expect(homeFooterVisibility(44)).toEqual({ mcpCommand: false, pluginCommand: false, version: false })
  })

  test("adds secondary hints as space becomes available", () => {
    expect(homeFooterVisibility(64)).toEqual({ mcpCommand: true, pluginCommand: false, version: true })
    expect(homeFooterVisibility(80)).toEqual({ mcpCommand: true, pluginCommand: true, version: true })
  })
})
