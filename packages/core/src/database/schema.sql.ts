/**
 * 数据库 schema SQL。
 * 导出用于建表的 SQL 文本。
 */
import { integer } from "drizzle-orm/sqlite-core"

export const Timestamps = {
  time_created: integer()
    .notNull()
    .$default(() => Date.now()),
  time_updated: integer()
    .notNull()
    .$onUpdate(() => Date.now()),
}
