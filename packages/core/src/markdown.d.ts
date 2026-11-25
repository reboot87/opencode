/**
 * Markdown 资源的类型声明。
 * 声明以文本形式内联打包的 Markdown 文件（如提示词模板）。
 */
declare module "*.md" {
  const content: string
  export default content
}
