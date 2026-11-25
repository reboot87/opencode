/**
 * 会话 Schema 再导出。
 * 从 schema 包集中再导出 Session 的 ID/Info 等类型构造器。
 */
export * as SessionSchema from "@opencode/schema/session"

import { Session } from "@opencode/schema/session"

export const ID = Session.ID
export type ID = typeof ID.Type

export const Info = Session.Info
export type Info = Session.Info
