/**
 * 插件应用接口。
 * 定义插件可访问的应用级能力接口。
 */
export interface App {
  readonly name: string
  readonly version: string
  readonly channel: string
}
