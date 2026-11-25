/**
 * mantle chat（对话） 模型别名入口。
 * 该文件仅作重导出别名：把上层 provider 门面中的 chat 模型工厂以 `model` 名称暴露，便于按 `mantle/chat` 路径引用；实际实现见父级 provider 文件。
 */
export { chatModel as model } from "../../amazon-bedrock-mantle.js"
export type { Settings } from "../../amazon-bedrock-mantle.js"
