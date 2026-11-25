/**
 * Code Mode 工具集合。
 * 定义沙箱内可用的工具集合类型。
 */
import type { Namespace } from "./namespace.js"
import type { Tool } from "./tool.js"

export type Tools<R = never> = {
  readonly [name: string]: Tool<R> | Namespace<R> | Tools<R>
}
