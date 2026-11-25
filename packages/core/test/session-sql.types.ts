/**
 * 会话·sql的类型定义（类型断言用）。
 *
 * 被测模块：@opencode/core/session-sql
 *
 * 覆盖该模块的核心行为与边界条件。
 */
import { SessionMessageTable } from "@opencode/core/session/sql"

type MessageData = (typeof SessionMessageTable.$inferInsert)["data"]

const user = {
  text: "Hello",
  time: { created: 0 },
} satisfies MessageData

const assistant = {
  agent: "build",
  model: { id: "model", providerID: "provider" },
  content: [],
  time: { created: 0 },
} satisfies MessageData

const invalid = {
  // @ts-expect-error Persisted message variants retain their field types.
  text: 42,
  time: { created: 0 },
} satisfies MessageData

void user
void assistant
void invalid
