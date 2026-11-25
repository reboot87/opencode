/**
 * 会话元数据类型。
 * 定义会话元数据的键值结构。
 */
import { Schema } from "effect"

/**
 * Host-supplied session annotations, durable and opaque to core. Keys are
 * arbitrary; values must be JSON-serializable. Children and forks inherit
 * the parent's current metadata unless the creator supplies its own.
 */
export const SessionMetadata = Schema.Record(Schema.String, Schema.Json).annotate({
  identifier: "Session.Metadata",
})
export type SessionMetadata = typeof SessionMetadata.Type
