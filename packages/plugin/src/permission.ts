/**
 * 权限断言类型。
 * 定义插件发起的权限断言输入结构与 Schema。
 */
import { Agent } from "@opencode/schema/agent"
import { Permission } from "@opencode/schema/permission"
import { Schema } from "effect"

export const AssertInput = Schema.Struct({
  sessionID: Permission.Request.fields.sessionID,
  agent: Agent.ID.pipe(Schema.optional),
  action: Permission.Request.fields.action,
  resources: Permission.Request.fields.resources,
  save: Permission.Request.fields.save,
  metadata: Permission.Request.fields.metadata,
  source: Permission.Request.fields.source,
})
export interface AssertInput extends Schema.Schema.Type<typeof AssertInput> {}
