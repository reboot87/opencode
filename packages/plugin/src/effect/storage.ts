/**
 * Effect 风格插件 API — 存储领域。
 * 插件的键值存储读写与扫描能力。此文件定义 Effect 风格 下该领域的接口与类型，与其它领域共同构成插件 API 表面。
 */
import type { Effect, Schema } from "effect"
import type { StorageScanOptions, StorageScanResult } from "../storage.js"

export interface StorageDomain {
  readonly get: (key: string) => Effect.Effect<Schema.Json | undefined>
  readonly set: (key: string, value: Schema.Json) => Effect.Effect<void>
  readonly remove: (key: string) => Effect.Effect<void>
  readonly scan: (options: StorageScanOptions) => Effect.Effect<StorageScanResult>
}
