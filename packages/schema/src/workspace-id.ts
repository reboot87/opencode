/**
 * 工作区 ID 类型。
 * 定义工作区的品牌 ID 类型。
 */
import { Schema } from "effect"
import { ascending } from "./identifier.js"
import { statics } from "./schema.js"

export const WorkspaceID = Schema.String.check(Schema.isStartingWith("wrk")).pipe(
  Schema.brand("Workspace.ID"),
  Schema.annotate({ identifier: "Workspace.ID" }),
  statics((schema) => {
    const create = () => schema.make("wrk_" + ascending())
    return {
      ascending: (id?: string) => {
        if (!id) return create()
        return schema.make(id)
      },
      create,
    }
  }),
)
export type WorkspaceID = typeof WorkspaceID.Type
