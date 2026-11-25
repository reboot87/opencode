/**
 * 集成 ID 类型。
 * 定义集成的品牌 ID 类型。
 */
import { Schema } from "effect"

export const IntegrationID = Schema.String.pipe(
  Schema.brand("Integration.ID"),
  Schema.annotate({ identifier: "Integration.ID" }),
)
export type IntegrationID = typeof IntegrationID.Type

export const IntegrationMethodID = Schema.String.pipe(
  Schema.brand("Integration.MethodID"),
  Schema.annotate({ identifier: "Integration.MethodID" }),
)
export type IntegrationMethodID = typeof IntegrationMethodID.Type
