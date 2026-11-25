/**
 * Promise 风格插件 API — 注册域。
 * 插件向宿主注册各类扩展（工具、命令、钩子等）的结构。此文件定义 Promise 风格 下该领域的接口与类型，与其它领域共同构成插件 API 表面。
 */
export interface Registration {
  readonly dispose: () => Promise<void>
}

export interface ModelHookOptions {
  /** Limits the hook to one provider. Unscoped hooks apply to every provider. */
  readonly providerID?: string
}

export type Hooks<Spec> = <Name extends keyof Spec>(
  name: Name,
  callback: (input: Spec[Name]) => Promise<void> | void,
) => Promise<Registration>

export type ModelHooks<Spec> = <Name extends keyof Spec>(
  name: Name,
  callback: (input: Spec[Name]) => Promise<void> | void,
  options?: Spec[Name] extends { readonly model: unknown } ? ModelHookOptions : never,
) => Promise<Registration>

export type Transform<Input> = (callback: (input: Input) => void) => Promise<Registration>
