/**
 * project的测试辅助模块。
 *
 * 被测模块：@opencode/core/lib/project
 *
 * 核心测试的公共辅助模块：内存数据库、会话夹具与事件收集工具。
 */
import { Database } from "@opencode/core/database/database"
import { Project } from "@opencode/core/project"
import { upsertProject } from "@opencode/core/project/sql"
import { makeGlobalNode } from "@opencode/util/effect/app-node"
import { Effect, Layer } from "effect"

export const globalProjectNode = makeGlobalNode({
  service: Project.Service,
  layer: Layer.effect(
    Project.Service,
    Effect.gen(function* () {
      const database = yield* Database.Service
      return Project.Service.of({
        list: () => Effect.succeed([]),
        update: () => Effect.die("not implemented"),
        activate: () => Effect.void,
        sweep: () => Effect.void,
        resolve: (directory) => {
          const project = { id: Project.ID.global, directory, canonical: directory }
          return upsertProject(database.db, project).pipe(Effect.orDie, Effect.as(project))
        },
      })
    }),
  ),
  deps: [Database.node],
})
