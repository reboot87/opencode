/**
 * 数据库迁移脚本。
 * 由 drizzle-kit 生成，记录一次结构变更的 up/down SQL；迁移按 id 顺序执行，不应手工修改。
 */
import { Effect } from "effect"
import type { DatabaseMigration } from "../migration.js"

const migration: DatabaseMigration.Migration = {
  id: "20260812181746_session_inbox",
  up(tx) {
    return Effect.gen(function* () {
      yield* tx.run(`
        CREATE TABLE \`session_inbox\` (
          \`id\` text PRIMARY KEY,
          \`session_id\` text NOT NULL,
          \`type\` text NOT NULL,
          \`payload\` text NOT NULL,
          \`delivery\` text NOT NULL,
          \`enqueued_seq\` integer NOT NULL,
          \`time_created\` integer NOT NULL,
          CONSTRAINT \`fk_session_inbox_session_id_session_v2_id_fk\` FOREIGN KEY (\`session_id\`) REFERENCES \`session_v2\`(\`id\`) ON DELETE CASCADE
        );
      `)
      yield* tx.run(
        `CREATE INDEX \`session_inbox_session_delivery_seq_idx\` ON \`session_inbox\` (\`session_id\`,\`delivery\`,\`enqueued_seq\`);`,
      )
      yield* tx.run(
        `CREATE UNIQUE INDEX \`session_inbox_session_enqueued_seq_idx\` ON \`session_inbox\` (\`session_id\`,\`enqueued_seq\`);`,
      )
    })
  },
}

export default migration
