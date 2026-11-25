/**
 * 数据库迁移脚本。
 * 由 drizzle-kit 生成，记录一次结构变更的 up/down SQL；迁移按 id 顺序执行，不应手工修改。
 */
import { Effect } from "effect"
import type { DatabaseMigration } from "../migration.js"

const migration: DatabaseMigration.Migration = {
  id: "20260423070820_add_icon_url_override",
  up(tx) {
    return Effect.gen(function* () {
      yield* tx.run(`
        ALTER TABLE \`project\` ADD \`icon_url_override\` text;
        UPDATE \`project\` SET \`icon_url_override\` = \`icon_url\` WHERE \`icon_url\` IS NOT NULL;
      `)
    })
  },
}

export default migration
