/**
 * 数据库迁移脚本。
 * 由 drizzle-kit 生成，记录一次结构变更的 up/down SQL；迁移按 id 顺序执行，不应手工修改。
 */
import { Effect } from "effect"
import type { DatabaseMigration } from "../migration.js"

const migration: DatabaseMigration.Migration = {
  id: "20260819222447_session_viewed_state",
  up(tx) {
    return Effect.gen(function* () {
      yield* tx.run(`ALTER TABLE \`session_v2\` ADD \`time_idle\` integer;`)
      yield* tx.run(`ALTER TABLE \`session_v2\` ADD \`time_viewed\` integer;`)
      yield* tx.run(`ALTER TABLE \`session_v2\` ADD \`idle_outcome\` text;`)
    })
  },
}

export default migration
