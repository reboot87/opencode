/**
 * 数据库迁移脚本。
 * 由 drizzle-kit 生成，记录一次结构变更的 up/down SQL；迁移按 id 顺序执行，不应手工修改。
 */
import { Effect } from "effect"
import type { DatabaseMigration } from "../migration.js"

const migration: DatabaseMigration.Migration = {
  id: "20260303231226_add_workspace_fields",
  up(tx) {
    return Effect.gen(function* () {
      yield* tx.run(`ALTER TABLE \`workspace\` ADD \`type\` text NOT NULL;`)
      yield* tx.run(`ALTER TABLE \`workspace\` ADD \`name\` text;`)
      yield* tx.run(`ALTER TABLE \`workspace\` ADD \`directory\` text;`)
      yield* tx.run(`ALTER TABLE \`workspace\` ADD \`extra\` text;`)
      yield* tx.run(`ALTER TABLE \`workspace\` DROP COLUMN \`config\`;`)
    })
  },
}

export default migration
