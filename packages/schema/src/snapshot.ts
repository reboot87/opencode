/**
 * 快照类型。
 * 定义文件系统快照与差异结构。
 */
export * as Snapshot from "./snapshot.js"

import { Schema } from "effect"

export const ID = Schema.String.pipe(Schema.brand("Snapshot.ID"), Schema.annotate({ identifier: "Snapshot.ID" }))
export type ID = typeof ID.Type
