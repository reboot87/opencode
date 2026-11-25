/**
 * cloudflare-workers-ai images（图片生成） 模型别名入口。
 * 该文件仅作重导出别名：把上层 provider 门面中的 images 模型工厂以 `model` 名称暴露，便于按 `cloudflare-workers-ai/images` 路径引用；实际实现见父级 provider 文件。
 */
export { imageModel as model } from "../cloudflare-workers-ai.js"
export type { Settings } from "../cloudflare-workers-ai.js"
