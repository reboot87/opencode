/**
 * zai-coding-plan responses（响应） 模型别名入口。
 * 该文件仅作重导出别名：把上层 provider 门面中的 responses 模型工厂以 `model` 名称暴露，便于按 `zai-coding-plan/responses` 路径引用；实际实现见父级 provider 文件。
 */
import type { ProviderPackage } from "../../provider-package.js"
import { ZAICodingPlan } from "../zai-coding-plan.js"
import { toConfig } from "../settings.js"

export type Settings = ZAICodingPlan.Settings<ZAICodingPlan.ResponsesOptionsInput>

export const model: ProviderPackage.Model<Settings, ZAICodingPlan.ResponsesOptionsInput> = (modelID, settings) =>
  ZAICodingPlan.configure(toConfig(settings)).responses(modelID)
