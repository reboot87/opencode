/**
 * 通用组件 — LinkSegmentsTest。
 * 跨场景复用的通用 UI 组件中负责 LinkSegmentsTest 部分，提供该部分所需的实现与类型定义。
 */
import { describe, expect, test } from "bun:test"
import { linkSegments } from "./link-segments"

describe("linkSegments", () => {
  test("marks URLs in shell output", () => {
    expect(linkSegments("Created https://github.com/anomalyco/opencode/pull/57302\n")).toEqual([
      { text: "Created " },
      {
        text: "https://github.com/anomalyco/opencode/pull/57302",
        href: "https://github.com/anomalyco/opencode/pull/57302",
      },
      { text: "\n" },
    ])
  })

  test("leaves trailing punctuation outside the link", () => {
    expect(linkSegments("(see https://example.com/a).")).toEqual([
      { text: "(see " },
      { text: "https://example.com/a", href: "https://example.com/a" },
      { text: ")." },
    ])
  })

  test("returns text without URLs as one run", () => {
    expect(linkSegments("no links here")).toEqual([{ text: "no links here" }])
    expect(linkSegments("")).toEqual([])
  })
})
