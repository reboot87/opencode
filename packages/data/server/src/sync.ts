/**
 * 数据服务 — Sync。
 * 提供数据查询的服务端中负责 Sync 部分，提供该部分所需的实现与类型定义。
 */
import { R2Sql } from "@opencode/data-core/r2-sql"
import { layer } from "@opencode/data-core/runtime"
import { syncData } from "@opencode/data-core/stat-sync"
import { Effect, Layer } from "effect"

// Runs one sync pass in this process, for local use. Deployed stages run the
// same steps in the DataSyncWorkflow.
await Effect.runPromise(
  syncData({ history: process.argv.includes("--history") }).pipe(Effect.provide(Layer.mergeAll(layer, R2Sql.layer))),
)
