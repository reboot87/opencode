/**
 * 权限的测试辅助模块。
 *
 * 被测模块：@opencode/core/lib/permission
 *
 * 核心测试的公共辅助模块：内存数据库、会话夹具与事件收集工具。
 */
import { Permission } from "@opencode/core/permission"
import { Effect, Layer } from "effect"

export const permissionLayer = (overrides: Partial<Permission.Interface> = {}) =>
  Layer.mock(Permission.Service, { close: Effect.void, nested: () => Effect.void, ...overrides })

export const permissionService = (overrides: Partial<Permission.Interface> = {}) =>
  Effect.runSync(
    Effect.gen(function* () {
      return yield* Permission.Service
    }).pipe(Effect.provide(permissionLayer(overrides))),
  )
