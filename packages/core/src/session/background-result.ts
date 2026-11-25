/**
 * 后台任务结果渲染工具。
 * 把后台执行结果渲染为可嵌入会话的 <background-result> 文本片段。
 */
export * as BackgroundResult from "./background-result.js"

export function render(attributes: string, body: string) {
  return `<background-result ${attributes}>\n${body}\n</background-result>`
}
