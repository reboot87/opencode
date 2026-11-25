/**
 * openai-compatible embeddings（嵌入） 模型别名入口。
 * 该文件仅作重导出别名：把上层 provider 门面中的 embeddings 模型工厂以 `model` 名称暴露，便于按 `openai-compatible/embeddings` 路径引用；实际实现见父级 provider 文件。
 */
export { embeddingModel as model } from "../openai-compatible.js"
export type { Settings } from "../openai-compatible.js"
