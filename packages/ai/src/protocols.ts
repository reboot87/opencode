/**
 * 协议模块的统一导出入口。
 * 把 protocols/ 子目录下所有 provider 协议（Anthropic Messages、OpenAI Chat/Responses、Gemini 等）
 * 集中再导出，供上层按协议名引用。
 */
export * from "./protocols/index.js"
