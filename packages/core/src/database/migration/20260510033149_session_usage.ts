/**
 * 数据库迁移脚本。
 * 由 drizzle-kit 生成，记录一次结构变更的 up/down SQL；迁移按 id 顺序执行，不应手工修改。
 */
import { Effect } from "effect"
import type { DatabaseMigration } from "../migration.js"

const migration: DatabaseMigration.Migration = {
  id: "20260510033149_session_usage",
  up(tx) {
    return Effect.gen(function* () {
      yield* tx.run(`ALTER TABLE \`session\` ADD \`cost\` real DEFAULT 0 NOT NULL;`)
      yield* tx.run(`ALTER TABLE \`session\` ADD \`tokens_input\` integer DEFAULT 0 NOT NULL;`)
      yield* tx.run(`ALTER TABLE \`session\` ADD \`tokens_output\` integer DEFAULT 0 NOT NULL;`)
      yield* tx.run(`ALTER TABLE \`session\` ADD \`tokens_reasoning\` integer DEFAULT 0 NOT NULL;`)
      yield* tx.run(`ALTER TABLE \`session\` ADD \`tokens_cache_read\` integer DEFAULT 0 NOT NULL;`)
      yield* tx.run(`ALTER TABLE \`session\` ADD \`tokens_cache_write\` integer DEFAULT 0 NOT NULL;`)
      yield* tx.run(`
        UPDATE session
        SET
          cost = coalesce((
            SELECT sum(coalesce(json_extract(message.data, '$.cost'), 0))
            FROM message
            WHERE message.session_id = session.id
              AND json_extract(message.data, '$.role') = 'assistant'
          ), 0),
          tokens_input = coalesce((
            SELECT sum(coalesce(json_extract(message.data, '$.tokens.input'), 0))
            FROM message
            WHERE message.session_id = session.id
              AND json_extract(message.data, '$.role') = 'assistant'
          ), 0),
          tokens_output = coalesce((
            SELECT sum(coalesce(json_extract(message.data, '$.tokens.output'), 0))
            FROM message
            WHERE message.session_id = session.id
              AND json_extract(message.data, '$.role') = 'assistant'
          ), 0),
          tokens_reasoning = coalesce((
            SELECT sum(coalesce(json_extract(message.data, '$.tokens.reasoning'), 0))
            FROM message
            WHERE message.session_id = session.id
              AND json_extract(message.data, '$.role') = 'assistant'
          ), 0),
          tokens_cache_read = coalesce((
            SELECT sum(coalesce(json_extract(message.data, '$.tokens.cache.read'), 0))
            FROM message
            WHERE message.session_id = session.id
              AND json_extract(message.data, '$.role') = 'assistant'
          ), 0),
          tokens_cache_write = coalesce((
            SELECT sum(coalesce(json_extract(message.data, '$.tokens.cache.write'), 0))
            FROM message
            WHERE message.session_id = session.id
              AND json_extract(message.data, '$.role') = 'assistant'
          ), 0)
      `)
    })
  },
}

export default migration
