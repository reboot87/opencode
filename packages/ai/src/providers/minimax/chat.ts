/**
 * MiniMax chat（对话） 模型别名入口。
 * 该文件仅作重导出别名：把上层 provider 门面中的 chat 模型工厂以 `model` 名称暴露，便于按 `minimax/chat` 路径引用；实际实现见父级 provider 文件。
 */
import type { ProviderPackage } from "../../provider-package.js"
import { MiniMax } from "../minimax.js"
import { toConfig } from "../settings.js"

export type Settings = MiniMax.Settings<MiniMax.ChatOptionsInput>

export const model: ProviderPackage.Model<Settings, MiniMax.ChatOptionsInput> = (modelID, settings) =>
  MiniMax.configure(toConfig(settings)).chat(modelID)
