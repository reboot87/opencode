/**
 * Shell 配置类型。
 * 定义 shell 配置项的 Schema。
 */
export * as ConfigShell from "./shell.js"

import { Schema } from "effect"

export const Option = Schema.Struct({
  path: Schema.String,
  name: Schema.String,
  acceptable: Schema.Boolean,
}).annotate({ identifier: "ConfigShell.Option" })
export interface Option extends Schema.Schema.Type<typeof Option> {}
