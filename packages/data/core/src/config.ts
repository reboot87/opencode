/**
 * 数据核心源码 — Config。
 * 数据采集与处理的实现中负责 Config 部分，提供该部分所需的实现与类型定义。
 */
import { Config, ConfigProvider, Effect, Layer, Schema } from "effect"
import * as Context from "effect/Context"
import { Resource } from "./resource"

export class AppConfigValue extends Schema.Class<AppConfigValue>("AppConfigValue")({
  stage: Schema.NonEmptyString,
  publicUrl: Schema.NonEmptyString,
}) {}

const decodeAppConfigValue = Schema.decodeUnknownSync(AppConfigValue)

// Read the linked stage lazily, so importing this module in a Worker does not
// touch bindings at module scope.
const config = Config.all({
  publicUrl: Config.String("PUBLIC_URL").pipe(Config.withDefault("http://localhost:3000")),
}).pipe(Config.map((value) => decodeAppConfigValue({ ...value, stage: Resource.App.stage })))

export class AppConfig extends Context.Service<AppConfig, AppConfigValue>()("@opencode/data/AppConfig") {
  static readonly config = config
  static readonly layer: Layer.Layer<AppConfig, never, never> = Layer.effect(
    AppConfig,
    config.parse(ConfigProvider.fromEnv()).pipe(Effect.orDie),
  )
}
