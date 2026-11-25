/**
 * 自动化作者判定。
 * 根据会话与权限信息判定某条自动化是否由当前用户触发。
 */
import type { Agent } from "../agent.js"
import type { Permission } from "../permission.js"
import type { SessionSchema } from "../session/schema.js"

export type Invocation = ReturnType<typeof Permission.invocation>

/** A tool call belongs to the model request that issued it, even if the Session has since switched agents. */
export function matchesAuthor(owner: SessionSchema.Info, agent: Agent.Info | undefined, invocation: Invocation) {
  return invocation.sessionID === owner.id && invocation.agent === agent?.id
}
