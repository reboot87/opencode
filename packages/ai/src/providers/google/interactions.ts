/**
 * Google Vertex AI interactions 模型别名入口。
 * 该文件仅作重导出别名：把上层 provider 门面中的 interactions 模型工厂以 `model` 名称暴露，便于按 `google/interactions` 路径引用；实际实现见父级 provider 文件。
 */
import { configure } from "../google.js"
import type { ProviderPackage } from "../../provider-package.js"
import type { GoogleInteractions } from "../../protocols/google-interactions.js"
import { toConfig } from "../settings.js"

export type Settings = ProviderPackage.Settings &
  GoogleInteractions.ProviderOptionsInput & {
    readonly apiKey?: string | false
    readonly baseURL?: string
  }

export const model: ProviderPackage.Model<Settings, GoogleInteractions.ProviderOptionsInput> = (modelID, settings) =>
  configure(toConfig(settings)).interactions(modelID)
