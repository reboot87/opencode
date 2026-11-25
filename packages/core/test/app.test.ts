/**
 * app的测试。
 *
 * 被测模块：@opencode/core/app
 *
 * 覆盖该模块的核心行为与边界条件。
 */
import { expect, test } from "bun:test"
import { App } from "@opencode/core/app"

test("formats app metadata as a user agent", () => {
  expect(App.useragent(App.make({ name: "sdk", version: "1.2.3", channel: "beta" }))).toBe("opencode/beta/1.2.3/sdk")
})
