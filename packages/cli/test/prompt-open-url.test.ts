/**
 * 提示词·打开·URL的测试。
 *
 * 被测模块：@opencode/cli/prompt-open-url
 *
 * 覆盖该模块的核心行为与边界条件。
 */
import { expect, test } from "bun:test"
import { Effect, Exit } from "effect"
import { openUrl } from "../src/ui/prompt"

test("suppresses browser open failures so the printed URL stays usable", async () => {
  const exit = await Effect.runPromiseExit(openUrl("not-a-browser-url"))
  expect(Exit.isSuccess(exit)).toBe(true)
})
