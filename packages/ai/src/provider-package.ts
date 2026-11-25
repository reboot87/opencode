/**
 * provider 包（provider package）的类型约定。
 *
 * 每个 provider 以 npm 包形式提供，导出一个 model(modelID, settings) 工厂，返回 LanguageModel。
 * Settings 是扁平可序列化的连接配置（baseURL / headers / body 等）；每个入口声明自己读取哪些连接键，
 * 其余键作为请求选项传给该协议的 route。
 */
import type { LanguageModel, ProviderOptions } from "./schema/index.js"
import type { CompactionOperations } from "./route/client.js"

/**
 * Flat, serializable settings for `model(modelID, settings)`. Each entrypoint declares the connection keys it
 * reads; every other key is a request option for the route's protocol.
 */
export interface Settings extends Readonly<Record<string, unknown>> {
  readonly baseURL?: string
  readonly headers?: Readonly<Record<string, string>>
  readonly body?: Readonly<Record<string, unknown>>
}

export interface Definition<
  ProviderSettings extends Settings = Settings,
  Options extends ProviderOptions = ProviderOptions,
  Compact extends CompactionOperations | undefined = CompactionOperations | undefined,
> {
  readonly model: (modelID: string, settings: ProviderSettings) => LanguageModel<Options, Compact>
}

/** provider 导出的 model 工厂类型：当 settings 的所有键都可选时，settings 参数也可省略。 */
export type Model<
  ProviderSettings extends Settings = Settings,
  Options extends ProviderOptions = ProviderOptions,
  Compact extends CompactionOperations | undefined = CompactionOperations | undefined,
> = (
  modelID: string,
  ...settings: {} extends ProviderSettings ? [settings?: ProviderSettings] : [settings: ProviderSettings]
) => LanguageModel<Options, Compact>

export * as ProviderPackage from "./provider-package.js"
