/**
 * vercel-ai-gateway responses（响应） 模型别名入口。
 * 该文件仅作重导出别名：把上层 provider 门面中的 responses 模型工厂以 `model` 名称暴露，便于按 `vercel-ai-gateway/responses` 路径引用；实际实现见父级 provider 文件。
 */
export { responsesModel as model } from "../vercel-ai-gateway.js"
export type { Settings } from "../vercel-ai-gateway.js"
