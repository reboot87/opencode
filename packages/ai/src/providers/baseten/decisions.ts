/**
 * Baseten decisions（结构化决策） 模型别名入口。
 * 该文件仅作重导出别名：把上层 provider 门面中的 decisions 模型工厂以 `model` 名称暴露，便于按 `baseten/decisions` 路径引用；实际实现见父级 provider 文件。
 */
export { decisionModel as model } from "../baseten.js"
export type { Settings } from "../baseten.js"
