/**
 * 数据核心源码 — Runtime。
 * 数据采集与处理的实现中负责 Runtime 部分，提供该部分所需的实现与类型定义。
 */
import { Layer, ManagedRuntime } from "effect"
import { AppConfig } from "./config"
import { layer as databaseLayer } from "./database"
import { GeoStatRepo } from "./domain/geo"
import { ModelStatRepo } from "./domain/model"
import { ProviderStatRepo } from "./domain/provider"
import { RetentionStatRepo } from "./domain/retention"

const repoLayer = Layer.mergeAll(
  ModelStatRepo.layer,
  ProviderStatRepo.layer,
  GeoStatRepo.layer,
  RetentionStatRepo.layer,
).pipe(Layer.provide(databaseLayer))

export const layer = Layer.mergeAll(AppConfig.layer, databaseLayer, repoLayer)
export const runtime = ManagedRuntime.make(layer)
export type RuntimeServices = ManagedRuntime.ManagedRuntime.Services<typeof runtime>
