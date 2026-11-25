/**
 * Moonshot messages（消息） 模型别名入口。
 * 该文件仅作重导出别名：把上层 provider 门面中的 messages 模型工厂以 `model` 名称暴露，便于按 `moonshot/messages` 路径引用；实际实现见父级 provider 文件。
 */
import type { ProviderPackage } from "../../provider-package.js"
import { Moonshot } from "../moonshot.js"
import { toConfig } from "../settings.js"

export type Settings = Moonshot.Settings<Moonshot.MessagesOptionsInput>

export const model: ProviderPackage.Model<Settings, Moonshot.MessagesOptionsInput> = (modelID, settings) =>
  Moonshot.configure(toConfig(settings)).messages(modelID)
