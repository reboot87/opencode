/**
 * 数据库迁移脚本。
 * 由 drizzle-kit 生成，记录一次结构变更的 up/down SQL；迁移按 id 顺序执行，不应手工修改。
 */
import { Effect } from "effect"
import type { DatabaseMigration } from "../migration.js"

// Azure CLI connections were OAuth credentials holding a copy of the CLI's token; they now reference the CLI as an
// external credential source. Dropping the token fields keeps the method and the resource in metadata.
const migration: DatabaseMigration.Migration = {
  id: "20261007190000_azure_cli_external_credential",
  up(tx) {
    return Effect.gen(function* () {
      yield* tx.run(`
        UPDATE \`credential\`
        SET \`value\` = json_remove(json_set(\`value\`, '$.type', 'external'), '$.access', '$.refresh', '$.expires')
        WHERE \`integration_id\` = 'azure'
          AND json_extract(\`value\`, '$.type') = 'oauth'
          AND json_extract(\`value\`, '$.methodID') = 'azure-cli'
      `)
    })
  },
}

export default migration
