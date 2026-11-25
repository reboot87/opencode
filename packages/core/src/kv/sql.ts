/**
 * 键值数据库表。
 * 定义 kv 表结构。
 */
import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { Timestamps } from "../database/schema.sql.js"
import type { KV } from "../kv.js"

export const KVTable = sqliteTable("kv", {
  key: text().primaryKey(),
  value: text({ mode: "json" }).$type<KV.Value>().notNull(),
  ...Timestamps,
})
