/**
 * 桌面插件 — EnableState。
 * 桌面端插件的加载与宿主能力中负责 EnableState 部分，提供该部分所需的实现与类型定义。
 */
import type { DatabaseSync } from "node:sqlite"
import type { EnableState } from "@opencode/plugin/gui/host"

/** Explicit settings only: both startup readers and the manager resolve absent rows through the same SDK rule. */
export function readEnableState(db: DatabaseSync): readonly EnableState[] {
  return db
    .prepare("SELECT id, enabled FROM plugin")
    .all()
    .map((row) => {
      // SAFETY: plugin.id is TEXT PRIMARY KEY; plugin.enabled is INTEGER NOT NULL in every journaled schema.
      const id = row.id as string

      return { id, enabled: row.enabled === 1 }
    })
}
