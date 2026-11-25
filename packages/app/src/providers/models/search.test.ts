/**
 * Provider 模型 — SearchTest。
 * provider 下模型的展示与配置中负责 SearchTest 部分，提供该部分所需的实现与类型定义。
 */
import { expect, test } from "bun:test"
import { matchesModelSearch } from "./search"

test.each([
  ["gpt 5", ["GPT-5.5"], true],
  ["gpt-5", ["GPT-5.5"], true],
  ["gpt5", ["GPT-5.5"], true],
  ["open ai", ["GPT-5.5", "gpt-5.5", "OpenAI"], true],
  ["gpt 5", ["GPT-5.5", "gpt-5.5", "OpenAI"], true],
  ["claude", ["GPT-5.5", "gpt-5.5", "OpenAI"], false],
])("matchesModelSearch(%p, %p) is %p", (query, fields, expected) => {
  expect(matchesModelSearch(query, fields)).toBe(expected)
})
