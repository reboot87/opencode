/**
 * 终端界面 — EditorZedSqliteNode。
 * OpenCode 终端界面的整体骨架与入口中负责 EditorZedSqliteNode 部分，提供该部分所需的实现与类型定义。
 */
import { DatabaseSync, type SQLInputValue } from "node:sqlite"

export class Database {
  readonly #database: DatabaseSync

  constructor(file: string, options?: { readonly?: boolean }) {
    this.#database = new DatabaseSync(file, { readOnly: options?.readonly })
  }

  query(sql: string) {
    const statement = this.#database.prepare(sql)
    return {
      all: (parameters?: Record<string, SQLInputValue>) => (parameters ? statement.all(parameters) : statement.all()),
      get: (parameters?: Record<string, SQLInputValue>) => (parameters ? statement.get(parameters) : statement.get()),
    }
  }

  close() {
    this.#database.close()
  }
}
