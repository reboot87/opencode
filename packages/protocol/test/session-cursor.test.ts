/**
 * 会话·光标的测试。
 *
 * 被测模块：@opencode/protocol/session-cursor
 *
 * 覆盖该模块的核心行为与边界条件。
 */
import { expect, test } from "bun:test"
import { Session } from "@opencode/schema/session"
import { SessionsCursor } from "../src/groups/session.js"

test("SessionsCursor remains the canonical session list cursor", () => {
  expect(SessionsCursor).toBe(Session.ListCursor)
})
