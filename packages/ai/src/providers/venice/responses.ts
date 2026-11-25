/**
 * Venice AI responses（响应） 模型别名入口。
 * 该文件仅作重导出别名：把上层 provider 门面中的 responses 模型工厂以 `model` 名称暴露，便于按 `venice/responses` 路径引用；实际实现见父级 provider 文件。
 */
import type { OpenResponsesProviderOptionsInput } from "../open-responses-options.js"
import type { Venice } from "../venice.js"
export { responsesModel as model } from "../venice.js"
export type Settings = Venice.Settings<OpenResponsesProviderOptionsInput>
