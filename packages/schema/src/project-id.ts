/**
 * 项目 ID 类型。
 * 定义项目的品牌 ID 类型。
 */
import { Schema } from "effect"
import { statics } from "./schema.js"

export const ProjectID = Schema.String.pipe(
  Schema.brand("Project.ID"),
  Schema.annotate({ identifier: "Project.ID" }),
  statics((schema) => ({ global: schema.make("global") })),
)
export type ProjectID = typeof ProjectID.Type
