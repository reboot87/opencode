/**
 * Effect 风格插件 API — 注册域。
 * 插件向宿主注册各类扩展（工具、命令、钩子等）的结构。此文件定义 Effect 风格 下该领域的接口与类型，与其它领域共同构成插件 API 表面。
 */
import type { Effect, Scope } from "effect"

export interface Registration {
  readonly dispose: Effect.Effect<void>
}

export interface ModelHookOptions {
  /** Limits the hook to one provider. Unscoped hooks apply to every provider. */
  readonly providerID?: string
}

export type Hooks<Spec, Failures extends Record<keyof Spec, unknown> = Record<keyof Spec, never>> = <
  Name extends keyof Spec,
>(
  name: Name,
  callback: (input: Spec[Name]) => Effect.Effect<void, Failures[Name]>,
) => Effect.Effect<Registration, never, Scope.Scope>

export type ModelHooks<Spec, Failures extends Record<keyof Spec, unknown> = Record<keyof Spec, never>> = <
  Name extends keyof Spec,
>(
  name: Name,
  callback: (input: Spec[Name]) => Effect.Effect<void, Failures[Name]>,
  options?: Spec[Name] extends { readonly model: unknown } ? ModelHookOptions : never,
) => Effect.Effect<Registration, never, Scope.Scope>

export type Transform<Input> = (callback: (input: Input) => void) => Effect.Effect<Registration, never, Scope.Scope>
