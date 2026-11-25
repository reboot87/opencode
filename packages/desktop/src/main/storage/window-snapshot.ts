/**
 * 本地存储 — WindowSnapshot。
 * 桌面端配置的本地持久化中负责 WindowSnapshot 部分，提供该部分所需的实现与类型定义。
 */
import { existsSync, readdirSync } from "node:fs"
import path from "node:path"
import { DatabaseSync } from "node:sqlite"
import type { WindowSnapshot } from "../../shared/ipc-transport"
import { migrateDatabase } from "./migration"
import { readEnableState } from "../plugin/enable-state"

// Before the storage layer exists, nothing has been written in this process and every namespace is at revision 0.
// Legacy electron-store files can make storage stale, but explicit plugin settings still come from SQLite.
export function readWindowSnapshot(userData: string, names: readonly string[]): WindowSnapshot {
  const file = path.join(userData, "drafts.sqlite")

  if (!existsSync(file)) return { storage: {}, plugins: [] }

  try {
    const legacy = readdirSync(userData).some((name) => name === "default.dat" || /^opencode\..+\.dat$/.test(name))
    const db = new DatabaseSync(file)

    try {
      migrateDatabase(db)

      const rows = db.prepare("SELECT key, value FROM state WHERE name = ?")

      return {
        storage: legacy
          ? {}
          : Object.fromEntries(
              names.map((name) => [
                name,
                {
                  // SAFETY: the journaled state table declares both selected columns TEXT NOT NULL.
                  items: Object.fromEntries(
                    (rows.all(name) as { key: string; value: string }[]).map((row) => [row.key, row.value]),
                  ),
                  revision: 0,
                },
              ]),
            ),
        plugins: readEnableState(db),
      }
    } finally {
      db.close()
    }
  } catch {
    return { storage: {} }
  }
}
