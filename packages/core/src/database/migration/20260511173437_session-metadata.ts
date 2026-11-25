/**
 * 数据库迁移脚本。
 * 由 drizzle-kit 生成，记录一次结构变更的 up/down SQL；迁移按 id 顺序执行，不应手工修改。
 */
import { Effect } from "effect"
import type { DatabaseMigration } from "../migration.js"

const migration: DatabaseMigration.Migration = {
  id: "20260511173437_session-metadata",
  up(tx) {
    return Effect.gen(function* () {
      // This column briefly shipped again under 20260530232709_lovely_romulus.
      if (
        (yield* tx.all<{ name: string }>(`PRAGMA table_info(\`session\`)`)).some((column) => column.name === "metadata")
      )
        return
      yield* tx.run(`ALTER TABLE \`session\` ADD \`metadata\` text;`)
    })
  },
}

export default migration
