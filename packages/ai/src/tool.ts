/**
 * 工具定义与构造模块（tool definition）。
 *
 * 这里的 Tool 是一个“自带 schema 的可执行单元”：把工具名、描述、输入/输出 schema、
 * 执行器打包在一起，并在内部缓存好编解码器与模型可见的定义，避免每次调用重建。
 *
 * 主要导出：
 *   - tool(...)：构造一个只有定义、可能带执行器的工具；
 *   - build(...)：构造带执行器的工具，并从 schema 推导出输入输出类型；
 *   - toDefinitions：把工具集合转成发给模型的 ToolDefinition 列表；
 *   - 各种 type：ToolInput / ToolExecute / FreeformOption 等类型约束。
 *
 * 类型安全是这个文件的核心：`FreeformOption` 等类型级技巧保证只有符合条件
 * （例如恰好有一个必填字符串字段）的工具才能声明 freeform 输入。
 */
import { Effect, JsonSchema, Schema } from "effect"
import type { Content } from "@opencode/schema/tool"
import type {
  Freeform,
  ToolCallPart,
  ToolDefinition as ToolDefinitionClass,
  ToolOutput as ToolOutputType,
} from "./schema/index.js"
import {
  ToolDefinition,
  ToolFailure,
  ToolOutput,
  type ToolDefinitionInput,
  type ToolEntryInput,
} from "./schema/index.js"
import { isRecord } from "./utils/record.js"

/**
 * 工具输入/输出值的 schema 约束：不允许依赖任何编解码服务（R=never）。
 * 工具应当自包含——纯数据转换之外的逻辑都放进执行器闭包里。
 */
export type ToolSchema<T> = Schema.Codec<T, any, never, never>

/** 工具的 input：Effect Schema 可解码并推导类型；裸 JSON Schema 只能得到 unknown。 */
export type ToolInput = ToolSchema<any> | JsonSchema.JsonSchema

/** execute 处理器拿到的输入值类型：从 ToolSchema 推导 T，裸 JSON Schema 则为 unknown。 */
export type ToolInputType<Input extends ToolInput> = Input extends ToolSchema<infer T> ? T : unknown

export interface ToolExecuteContext {
  readonly id: ToolCallPart["id"]
  readonly name: ToolCallPart["name"]
  readonly namespace?: ToolCallPart["namespace"]
}

export type ToolExecute<Input extends ToolInput, Success extends ToolSchema<any>> = (
  input: ToolInputType<Input>,
  context?: ToolExecuteContext,
) => Effect.Effect<Schema.Schema.Type<Success>, ToolFailure>

export interface ToolModelOutputInput<Input, Output> {
  readonly id: ToolCallPart["id"]
  readonly input: Input
  readonly output: Output
}

export type ToolToModelOutput<Input extends ToolInput, Success extends ToolSchema<any>> = (
  result: ToolModelOutputInput<ToolInputType<Input>, Success["Encoded"]>,
) => ReadonlyArray<Content>

type FreeformField<T> = {
  [K in keyof T]-?: [Exclude<keyof T, K>] extends [never]
    ? {} extends Pick<T, K>
      ? never
      : T[K] extends string
        ? K
        : never
    : never
}[keyof T]

type RequiredStringField<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : T[K] extends string ? K : never
}[keyof T]

/**
 * 类型级推导：决定一个工具能否声明 freeform（自由文本）输入，以及字段名。
 *   - 输入类型未知（裸 JSON Schema）→ 允许 Freeform；
 *   - 存在多个字符串字段 → 允许 Freeform 且可指定 field；
 *   - 恰好一个必填字符串字段 → 允许 Freeform 并自动指向该字段；
 *   - 没有字符串字段 → 为 undefined（不能声明 freeform）。
 */
export type FreeformOption<Input extends ToolInput> =
  unknown extends ToolInputType<Input>
    ? Freeform
    : [FreeformField<ToolInputType<Input>>] extends [never]
      ? [RequiredStringField<ToolInputType<Input>>] extends [never]
        ? undefined
        : Freeform & { readonly field: RequiredStringField<ToolInputType<Input>> }
      : Freeform & { readonly field?: FreeformField<ToolInputType<Input>> }

/**
 * 类型安全的 LLM 工具。每个工具自带描述、输入 schema 和成功 schema。
 * execute 执行器是可选的：若只想把工具 schema 暴露给模型、在别处处理调用，可以省略。
 *
 * 错误必须用 ToolFailure 表达；未映射的错误和缺陷会让整个流失败。
 * 内部还缓存了编解码器和预先算好的 ToolDefinition，避免每次调用重建。
 */
export interface Tool<Input extends ToolInput = any, Success extends ToolSchema<any> = any> {
  /** 模型看到并调用的工具名。 */
  readonly name: string
  readonly description: string
  readonly input: Input
  readonly success: Success
  readonly execute?: ToolExecute<Input, Success>
  readonly toModelOutput?: ToolToModelOutput<Input, Success>
  readonly toStructuredOutput?: (output: Success["Encoded"]) => unknown
  /** @internal 把模型传入的未知输入解码成工具输入类型。 */
  readonly _decode: (input: unknown) => Effect.Effect<ToolInputType<Input>, Schema.SchemaError>
  // 用方法语法保持参数双变（bivariant），使具体工具可赋值给 ExecutableTool。
  /** @internal 把执行结果编码回对外值。 */
  _encode(value: Schema.Schema.Type<Success>): Effect.Effect<unknown, Schema.SchemaError>
  /** @internal 把原始输出投影成 ToolOutput。 */
  _project(input: ToolInputType<Input>, id: ToolCallPart["id"], output: unknown): ToolOutputType
  /** @internal 是否为旧式结果格式。 */
  readonly _legacyResult: boolean
  /** @internal 预先算好的、发给模型的工具定义。 */
  readonly _definition: ToolDefinitionClass
}

/** Message.tools 的工具变更：add 接受请求 tools 的参数类型，remove 接受同样的工具或工具名。 */
export interface ToolChangesInput {
  readonly add?: ReadonlyArray<Tool | ToolEntryInput>
  readonly remove?: ReadonlyArray<Tool | ToolEntryInput | string>
}

/** A tool with an `execute` handler, which `LLM.loop` and `ToolRuntime.dispatch` can run. */
export type ExecutableTool<Input extends ToolInput = any, Success extends ToolSchema<any> = any> = Tool<
  Input,
  Success
> & {
  readonly execute: ToolExecute<Input, Success>
}

/**
 * Options for `tool`, where `Execute` is the only part that differs between the Effect and Promise clients. Pass an
 * Effect Schema `input` (and optionally a `success` schema that validates the result, otherwise it is sent as is with
 * `undefined` as `null`), or a raw JSON Schema `input` known only at runtime, such as an MCP tool's, with an optional
 * JSON Schema `outputSchema`. Omit `execute` to declare a tool the model can call without running it here.
 */
export type ToolOptions<
  Input extends ToolInput,
  Success extends ToolSchema<any>,
  Execute = ToolExecute<Input, Success>,
> = {
  readonly name: string
  readonly description: string
  readonly input: Input
  readonly freeform?: FreeformOption<Input>
  readonly execute?: Execute
  readonly toModelOutput?: ToolToModelOutput<Input, Success>
  readonly toStructuredOutput?: (output: Success["Encoded"]) => unknown
} & (Input extends ToolSchema<any> ? { readonly success?: Success } : { readonly outputSchema?: JsonSchema.JsonSchema })

/**
 * Constructs a tool whose `execute` returns an Effect that fails with `ToolFailure`.
 *
 * ```ts
 * tool({
 *   name: "weather",
 *   description: "Get current weather",
 *   input: Schema.Struct({ city: Schema.String }),
 *   success: Schema.Struct({ temperature: Schema.Number }),
 *   execute: ({ city }) => Effect.succeed({ temperature: 22 }),
 * })
 * ```
 */
export const tool = <
  Input extends ToolInput = typeof Schema.Unknown,
  Success extends ToolSchema<any> = typeof Schema.Unknown,
  Result extends Effect.Effect<Schema.Schema.Type<Success>, ToolFailure> | NoExecute = NoExecute,
>(
  config: ToolOptions<Input, Success, (input: ToolInputType<Input>, context?: ToolExecuteContext) => Result>,
) => build(config, config.execute)

declare const noExecute: unique symbol
/** @internal 省略 execute 时推导出的结果类型；没有任何函数能真正返回它，用于类型层面区分“无执行器”。 */
export type NoExecute = { readonly [noExecute]: never }

/**
 * @internal 根据配置和执行器构造工具（同时服务客户端与服务端）。
 * 重载签名用类型技巧判断：有 execute → ExecutableTool；没有 → 普通 Tool；Result 为 any 时按可执行处理。
 * 实现里根据 input 是不是 Effect Schema 分两条路：
 *   - Effect Schema：用 decodeUnknownEffect / encodeEffect 做输入输出编解码；
 *   - 裸 JSON Schema：直接放行（解码/编码都是 Effect.succeed），因为无法做类型级编解码。
 */
export function build<Input extends ToolInput, Success extends ToolSchema<any>, Result>(
  config: ToolOptions<Input, Success, (...args: never) => Result>,
  execute: ((input: ToolInputType<Input>, context?: ToolExecuteContext) => unknown) | undefined,
): 0 extends 1 & Result // `any`
  ? ExecutableTool<Input, Success>
  : [Result, NoExecute] extends [NoExecute, Result]
    ? Tool<Input, Success>
    : ExecutableTool<Input, Success>
export function build(
  config: Omit<ToolOptions<ToolInput, ToolSchema<any>, unknown>, "success" | "outputSchema"> & {
    readonly success?: ToolSchema<any>
    readonly outputSchema?: JsonSchema.JsonSchema
  },
  execute: ((input: any, context?: ToolExecuteContext) => any) | undefined,
): Tool {
  const shared = {
    name: config.name,
    description: config.description,
    execute,
    toModelOutput: config.toModelOutput,
    toStructuredOutput: config.toStructuredOutput,
    _project: (input: unknown, id: ToolCallPart["id"], output: unknown) =>
      project(config.toModelOutput, config.toStructuredOutput, input, id, output),
  }
  const input = config.input
  // 裸 JSON Schema 分支：无法类型级编解码，直接放行；结果格式按是否自定义输出判断
  if (!Schema.isSchema(input))
    return {
      ...shared,
      input,
      success: Schema.Unknown,
      _decode: Effect.succeed,
      _encode: Effect.succeed,
      _legacyResult: config.toModelOutput === undefined && config.toStructuredOutput === undefined,
      _definition: definition({
        name: config.name,
        description: config.description,
        inputSchema: input,
        outputSchema: config.outputSchema,
        freeform: config.freeform,
      }),
    }
  // Effect Schema 分支：用 schema 做真正的编解码
  return {
    ...shared,
    input,
    success: config.success ?? Schema.Unknown,
    _decode: Schema.decodeUnknownEffect(input),
    _encode: config.success ? Schema.encodeEffect(config.success) : (value) => Effect.succeed(value ?? null),
    _legacyResult: false,
    _definition: definition({
      name: config.name,
      description: config.description,
      inputSchema: emptyInputJsonSchema(input) ?? toJsonSchema(input),
      outputSchema: config.success && toJsonSchema(config.success),
      freeform: config.freeform,
    }),
  }
}

/** 取出每个工具的预计算定义，供 LLMRequest.tools 使用（保持数组顺序）。 */
export const toDefinitions = (tools: ReadonlyArray<Tool>): ReadonlyArray<ToolDefinitionClass> =>
  tools.map((item) => item._definition)

/**
 * 把“无参数”的 Effect 工具输入描述成空对象；若工具带参数则返回 undefined。
 *
 * 背景：Effect 对没有任何属性/索引签名的 struct 会生成 `{ not: { type: "null" } }`，
 * 但模型提供方要求工具参数必须描述成一个 object。这里识别这种情况并转成
 * `type: "object", properties: {}, additionalProperties: false`。
 * 只保留注解关键字（title/description 等）；出现其它约束（如 minProperties）则原样返回，
 * 交由 toJsonSchema 处理。
 */
export const emptyInputJsonSchema = (schema: Schema.Top): JsonSchema.JsonSchema | undefined => {
  const { not, ...rest } = Schema.toJsonSchemaDocument(schema, { referencePolicy: () => undefined }).schema
  if (!isRecord(not) || not.type !== "null" || Object.keys(not).length !== 1) return undefined
  if (!Object.keys(rest).every((key) => annotationKeywords.has(key))) return undefined
  return { ...rest, type: "object", properties: {}, additionalProperties: false }
}

/** 构造 ToolDefinition，并校验 freeform 配置是否符合 schema（否则 early error）。 */
const definition = (input: ToolDefinitionInput) => {
  // freeform 要求 schema 里有合适的字符串字段，找不到就报错
  if (input.freeform !== undefined && ToolDefinition.freeformField(input.inputSchema, input.freeform) === undefined)
    throw new Error(
      input.freeform.field === undefined
        ? "A freeform tool needs exactly one parameter, a required string"
        : `A freeform tool's \`${input.freeform.field}\` parameter must be a required string`,
    )
  return new ToolDefinition(input)
}

/** JSON Schema 的注解型关键字：这些关键字不影响数据形状，仅在 emptyInputJsonSchema 里被保留。 */
const annotationKeywords = new Set(["title", "description", "default", "examples", "readOnly", "writeOnly"])

/** 把 Effect Schema 转成 JSON Schema；若有定义（$defs），把它们一并附上。 */
const toJsonSchema = (schema: Schema.Top): JsonSchema.JsonSchema => {
  const document = Schema.toJsonSchemaDocument(schema, { onExcessProperty: "error" })
  if (Object.keys(document.definitions).length === 0) return document.schema
  return { ...document.schema, $defs: document.definitions }
}

/**
 * 把工具原始输出投影成 ToolOutput：
 *   - 若有 toStructuredOutput 就用它转换结构化输出，否则原样；
 *   - 若有 toModelOutput 就用它生成给模型看的内容，否则默认：字符串直接当文本，其它类型给空内容。
 */
const project = (
  toModelOutput: ((input: ToolModelOutputInput<any, any>) => ReadonlyArray<Content>) | undefined,
  toStructuredOutput: ((output: unknown) => unknown) | undefined,
  input: unknown,
  id: ToolCallPart["id"],
  output: unknown,
): ToolOutputType =>
  ToolOutput.make(
    toStructuredOutput?.(output) ?? output,
    toModelOutput?.({ id, input, output }) ?? (typeof output === "string" ? [{ type: "text", text: output }] : []),
  )

export { ToolFailure }
