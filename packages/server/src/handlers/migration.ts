/**
 * migration 接口处理器。
 * 迁移接口处理器：v1 迁移状态查询与触发。
 */
import { V1Migration } from "@opencode/core/database/v1-migration"
import { HttpApiBuilder } from "effect/http-api"
import { Effect } from "effect"
import { Api } from "../api"

export const MigrationHandler = HttpApiBuilder.group(Api, "server.migration", (handlers) =>
  handlers.handle(
    "migration.v1.status",
    Effect.fn(function* () {
      return yield* V1Migration.status()
    }),
  ),
)
