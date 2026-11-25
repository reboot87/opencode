/**
 * SQLite 运行时（Node）。
 * 在 Node 运行时提供 SqlClient 实现与能力声明。
 */
import { SqliteClient } from "@effect/sql-sqlite-node"
import { Layer, Option, Schema } from "effect"
import type { SqlClient } from "effect/sql"

export const supportsTuningPragmas = true

// Foreign keys default ON in node:sqlite and can be toggled per connection.
export const supportsForeignKeyToggle = true

// Opening the database can only fail on a broken file or a lock held past
// busyTimeout; Database.layer treats both as fatal.
export const sqliteLayer = (config: SqliteClient.SqliteClientConfig): Layer.Layer<SqlClient.SqlClient> =>
  Layer.orDie(SqliteClient.layer(config))

// node:sqlite has no error class: SQLite failures are an Error marked ERR_SQLITE_ERROR that carries SQLite's extended
// result code in errcode.
const decodeDriverError = Schema.decodeUnknownOption(
  Schema.Struct({ code: Schema.Literal("ERR_SQLITE_ERROR"), errcode: Schema.Number }),
)

export const resultCode = (cause: unknown) =>
  decodeDriverError(cause).pipe(
    Option.map((error) => error.errcode),
    Option.getOrUndefined,
  )
