/**
 * 会话·父级·创建的测试。
 *
 * 被测模块：@opencode/client/session-parent-create
 *
 * 覆盖该模块的核心行为与边界条件。
 */
import { expect, test } from "bun:test"
import { OpenCode } from "../src/promise/index"

test("session.create forwards parentID from the Promise client", async () => {
  let body: unknown
  const client = OpenCode.make({
    baseUrl: "http://localhost:3000",
    fetch: async (_input, init) => {
      body = JSON.parse(String(init?.body))
      return Response.json({ data: { id: "ses_child" } })
    },
  })

  const child = await client.session.create({ parentID: "ses_parent", title: "Child" })

  expect(child.id).toBe("ses_child")
  expect(body).toEqual({ parentID: "ses_parent", title: "Child" })
})
