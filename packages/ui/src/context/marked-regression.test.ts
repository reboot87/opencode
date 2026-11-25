/**
 * UI 上下文 — MarkedRegressionTest。
 * UI 包的上下文提供者中负责 MarkedRegressionTest 部分，提供该部分所需的实现与类型定义。
 */
import { expect, test } from "bun:test"
import { Marked } from "marked"

test("preserves code spans adjacent to tildes", async () => {
  const marked = new Marked()

  expect(await marked.parse("~`0.1576` to measurement-window-only `0.00092`")).toBe(
    "<p>~<code>0.1576</code> to measurement-window-only <code>0.00092</code></p>\n",
  )
  expect(await marked.parse("`before`~`after`")).toBe("<p><code>before</code>~<code>after</code></p>\n")
  expect(await marked.parse("~~`deleted code`~~")).toBe("<p><del><code>deleted code</code></del></p>\n")
})
