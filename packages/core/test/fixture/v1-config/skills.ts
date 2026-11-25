/**
 * 技能测试夹具。
 *
 * 提供 v1 格式的配置样例，用于配置迁移与兼容校验。
 */
export * as ConfigSkillsV1 from "./skills"

import { Schema } from "effect"

export const Info = Schema.Struct({
  paths: Schema.optional(Schema.Array(Schema.String)).annotate({
    description: "Additional paths to skill folders",
  }),
  urls: Schema.optional(Schema.Array(Schema.String)).annotate({
    description: "URLs to fetch skills from (e.g., https://example.com/.well-known/skills/)",
  }),
})
export type Info = Schema.Schema.Type<typeof Info>
