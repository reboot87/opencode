/**
 * 数据库迁移脚本。
 * 由 drizzle-kit 生成，记录一次结构变更的 up/down SQL；迁移按 id 顺序执行，不应手工修改。
 */
import { Effect } from "effect"
import type { DatabaseMigration } from "../migration.js"

const migration: DatabaseMigration.Migration = {
  id: "20260622202450_simplify_session_input",
  up(tx) {
    return Effect.gen(function* () {
      yield* tx.run(`DELETE FROM \`session_context_epoch\`;`)
      yield* tx.run(`DELETE FROM \`session_input\`;`)
      yield* tx.run(`DELETE FROM \`session_message\`;`)
      yield* tx.run(`DELETE FROM \`event\`;`)
      yield* tx.run(`DELETE FROM \`event_sequence\`;`)
      yield* tx.run(`UPDATE \`session\` SET \`workspace_id\` = NULL WHERE \`workspace_id\` IS NOT NULL;`)
      yield* tx.run(`DELETE FROM \`workspace\`;`)
    })
  },
}

export default migration
