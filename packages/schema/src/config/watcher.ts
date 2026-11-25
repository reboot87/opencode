/**
 * 监听配置类型。
 * 定义 watcher 配置项的 Schema。
 */
export * as ConfigWatcher from "./watcher.js"

import { Schema } from "effect"
import { optional } from "../schema.js"

export class Info extends Schema.Class<Info>("Config.Watcher")({
  ignore: Schema.String.pipe(Schema.Array, optional),
}) {}
