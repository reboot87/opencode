/**
 * 决策模型（Decision Model）API：让模型对一组结构化“问题”给出结构化“答案”。
 *
 * 与 chat 的区别：这里不是开放对话，而是让模型做三类确定性判断：
 *   - predicate：判断真伪（可附 true/false 判定标准）；
 *   - choice：从候选项里选一个（值区分类型：true 与 "true" 不同）；
 *   - score：按分级标签打分。
 *
 * 文件结构：输入类型（Parts / Questions）→ 答案类型（Answer）→ 模型封装（DecisionModel / Route）
 * → 请求构建（request）→ generate（生成并校验答案）。
 * 大量使用 Schema 做运行时校验和类型推导，AnswerFor / AnswersFor 在类型层面把答案形状和问题对应起来。
 */
import { Effect, Schema } from "effect"
import { DecisionClient, Service, type Execute } from "./decision-client.js"
import { Media } from "./media.js"
import { tryRequest } from "./media-model.js"
import {
  AIError,
  type BaseRequest,
  type TransportOptions,
  ModelID,
  ProviderID,
  ProviderMetadata,
  ProviderOptions,
  type OpenString,
} from "./schema/index.js"

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export const DecisionTextPart = Schema.Struct({ type: Schema.Literal("text"), text: Schema.String })
export const DecisionJsonPart = Schema.Struct({ type: Schema.Literal("json"), value: Schema.Json })
export const DecisionMediaPart = Schema.Struct({
  type: Schema.Literal("media"),
  media: Media.AssetSchema,
  filename: Schema.optional(Schema.String),
})
export const DecisionPart = Schema.Union([DecisionTextPart, DecisionJsonPart, DecisionMediaPart]).pipe(
  Schema.toTaggedUnion("type"),
)
export type DecisionPart = Schema.Schema.Type<typeof DecisionPart>

/** A media part as input: `media` may be plain data, with `mediaType` naming its type when the content can't. */
export type DecisionMediaPartInput = Omit<typeof DecisionMediaPart.Type, "media"> & {
  readonly media: Media.Input
  readonly mediaType?: string
}
export type DecisionPartInput = Exclude<DecisionPart, { readonly type: "media" }> | DecisionMediaPartInput

/** A plain object is one `json` part. */
export type DecisionInput = typeof Schema.JsonObject.Type | ReadonlyArray<DecisionPartInput>

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

/** 选项值带类型：布尔 true 与字符串 "true" 是两个不同的值。 */
export const ChoiceValue = Schema.Union([Schema.String, Schema.Boolean])
export type ChoiceValue = Schema.Schema.Type<typeof ChoiceValue>

export const PredicateQuestion = Schema.Struct({
  name: Schema.String,
  type: Schema.Literal("predicate"),
  instructions: Schema.String,
  /** 判定标准：当指令本身不足以区分真伪时，说明什么算 true、什么算 false。 */
  criteria: Schema.optional(
    Schema.Struct({ true: Schema.optional(Schema.String), false: Schema.optional(Schema.String) }),
  ),
})
export type PredicateQuestion = Schema.Schema.Type<typeof PredicateQuestion>

export const ChoiceQuestion = Schema.Struct({
  name: Schema.String,
  type: Schema.Literal("choice"),
  instructions: Schema.String,
  choices: Schema.Array(Schema.Struct({ value: ChoiceValue, description: Schema.optional(Schema.String) })),
})
export type ChoiceQuestion = Schema.Schema.Type<typeof ChoiceQuestion>

export const ScoreQuestion = Schema.Struct({
  name: Schema.String,
  type: Schema.Literal("score"),
  instructions: Schema.String,
  levels: Schema.Array(Schema.Struct({ label: Schema.String, description: Schema.optional(Schema.String) })),
})
export type ScoreQuestion = Schema.Schema.Type<typeof ScoreQuestion>

export const DecisionQuestion = Schema.Union([PredicateQuestion, ChoiceQuestion, ScoreQuestion]).pipe(
  Schema.toTaggedUnion("type"),
)
export type DecisionQuestion = Schema.Schema.Type<typeof DecisionQuestion>
export type DecisionQuestions = ReadonlyArray<DecisionQuestion>

// 这里只校验会让请求变得“无意义”的部分；数量、大小等限制由宿主（调用方）负责。
const DecisionQuestionList = Schema.Array(DecisionQuestion).pipe(
  Schema.refine((x): x is typeof x => x.length > 0, { message: "Decision questions must not be empty" }),
  Schema.refine((x): x is typeof x => new Set(x.map((question) => question.name)).size === x.length, {
    message: "Decision question names must be unique",
  }),
)

// ---------------------------------------------------------------------------
// Answers
// ---------------------------------------------------------------------------

const Probability = Schema.Number.check(Schema.isBetween({ minimum: 0, maximum: 1 }))

export const PredicateAnswer = Schema.Struct({
  name: Schema.String,
  type: Schema.Literal("predicate"),
  probability: Probability,
})
export type PredicateAnswer = Schema.Schema.Type<typeof PredicateAnswer>

export const ChoiceAnswer = Schema.Struct({
  name: Schema.String,
  type: Schema.Literal("choice"),
  choice: ChoiceValue,
  probabilities: Schema.Array(Schema.Struct({ value: ChoiceValue, probability: Probability })),
  confidence: Probability,
})
export type ChoiceAnswer = Schema.Schema.Type<typeof ChoiceAnswer>

/** `score` is the probability-weighted level index; `probabilities` has one entry per level. */
export const ScoreAnswer = Schema.Struct({
  name: Schema.String,
  type: Schema.Literal("score"),
  score: Schema.Number,
  probabilities: Schema.Array(Schema.Struct({ value: Schema.Int, label: Schema.String, probability: Probability })),
  confidence: Probability,
})
export type ScoreAnswer = Schema.Schema.Type<typeof ScoreAnswer>

/** Why a question has no answer; hosts may report reasons beyond these. */
export type ErrorReason = OpenString<"refusal">
export const ErrorReason: Schema.Codec<ErrorReason> = Schema.Union([Schema.Literal("refusal"), Schema.String])

/** This one question has no answer; the other answers still came back. */
export const ErrorAnswer = Schema.Struct({
  name: Schema.String,
  type: Schema.Literal("error"),
  reason: ErrorReason,
  message: Schema.optional(Schema.String),
})
export type ErrorAnswer = Schema.Schema.Type<typeof ErrorAnswer>

export const DecisionAnswer = Schema.Union([PredicateAnswer, ChoiceAnswer, ScoreAnswer, ErrorAnswer]).pipe(
  Schema.toTaggedUnion("type"),
)
export type DecisionAnswer = Schema.Schema.Type<typeof DecisionAnswer>

type ChoiceValueOf<Question> = Question extends { readonly choices: ReadonlyArray<{ readonly value: infer Value }> }
  ? Value
  : never

export type AnswerFor<Question extends DecisionQuestion> =
  | (Question extends { readonly type: "predicate" }
      ? PredicateAnswer & { readonly name: Question["name"] }
      : Question extends { readonly type: "choice" }
        ? {
            readonly name: Question["name"]
            readonly type: "choice"
            readonly choice: ChoiceValueOf<Question>
            readonly probabilities: ReadonlyArray<{
              readonly value: ChoiceValueOf<Question>
              readonly probability: number
            }>
            readonly confidence: number
          }
        : ScoreAnswer & { readonly name: Question["name"] })
  | (ErrorAnswer & { readonly name: Question["name"] })

/** One answer per question, in question order. */
export type AnswersFor<Questions extends DecisionQuestions> = {
  readonly [Index in keyof Questions]: AnswerFor<Questions[Index]>
}

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------

export type DecisionOptions = Record<string, unknown>

/**
 * 决策模型的路由抽象：定义一个决策模型“如何生成答案”。
 * 协议实现通过 `DecisionRoute.make(...).model(...)` 构造它。
 */
export interface DecisionModelRoute<Options extends DecisionOptions = DecisionOptions> {
  readonly id: string
  generate(request: DecisionRequest<DecisionModel<Options>>, execute: Execute): Effect.Effect<DecisionResponse, AIError>
}

/** 协议需要适配的宿主特性（类似语言模型的 LanguageModelCompatibility）。 */
export class DecisionModelCompatibility extends Schema.Class<DecisionModelCompatibility>("Decision.ModelCompatibility")(
  {
    /**
     * System One 宿主从哪里读取媒体，取自 models.dev 的 `[api.systemone] compatibility.media_input`。
     * 命名依据是媒体在请求体中的位置：assets（TypeSafe 的 assets 映射，从 state 引用）、
     * state（state 列表内的条目）、root（每类一个顶层列表：images / audio / videos）。
     */
    mediaInput: Schema.optional(Schema.Literals(["assets", "state", "root"])),
  },
) {}

export namespace DecisionModelCompatibility {
  export type Input = DecisionModelCompatibility | ConstructorParameters<typeof DecisionModelCompatibility>[0]

  export const make = (input: Input) =>
    input instanceof DecisionModelCompatibility ? input : new DecisionModelCompatibility(input)
}

export class DecisionModel<Options extends DecisionOptions = DecisionOptions> {
  declare protected readonly _Options: Options
  readonly id: ModelID
  readonly provider: ProviderID
  readonly route: DecisionModelRoute<Options>
  /** 部署级的 headers / 超时 / http 覆盖，优先级低于每个请求自己的设置。 */
  readonly transport?: TransportOptions
  readonly compatibility?: DecisionModelCompatibility
  /** 每个请求 providerOptions 的默认值，例如 provider 包从自身 settings 读取的选项。 */
  readonly providerOptions?: ProviderOptions

  constructor(input: DecisionModel.Input<Options>) {
    this.id = input.id
    this.provider = input.provider
    this.route = input.route
    this.transport = input.transport
    this.compatibility = input.compatibility
    this.providerOptions = input.providerOptions
  }

  static make<Options extends DecisionOptions = DecisionOptions>(input: DecisionModel.MakeInput<Options>) {
    return new DecisionModel<Options>({
      ...input,
      id: ModelID.make(input.id),
      provider: ProviderID.make(input.provider),
    })
  }
}

export namespace DecisionModel {
  export interface Input<Options extends DecisionOptions = DecisionOptions> {
    readonly id: ModelID
    readonly provider: ProviderID
    readonly route: DecisionModelRoute<Options>
    readonly transport?: TransportOptions
    readonly compatibility?: DecisionModelCompatibility
    readonly providerOptions?: ProviderOptions
  }

  export interface MakeInput<Options extends DecisionOptions = DecisionOptions>
    extends Omit<Input<Options>, "id" | "provider"> {
    readonly id: string | ModelID
    readonly provider: string | ProviderID
  }
}

export const DecisionModelSchema = Schema.declare((value): value is DecisionModel => value instanceof DecisionModel, {
  expected: "Decision.Model",
})

export type DecisionModelOptions<Model> = Model extends DecisionModel<infer Options> ? Options : never

// ---------------------------------------------------------------------------
// Request and response
// ---------------------------------------------------------------------------

const DecisionRequestSchema = Schema.Struct({
  model: DecisionModelSchema,
  input: Schema.Array(DecisionPart),
  questions: DecisionQuestionList,
  providerOptions: Schema.optional(ProviderOptions),
})

/** A normalized decision request, the plain object `ai.decision.request(...)` returns. */
export interface DecisionRequest<
  Model extends DecisionModel = DecisionModel,
  Questions extends DecisionQuestions = DecisionQuestions,
> extends BaseRequest<Model, DecisionModelOptions<Model>> {
  readonly input: ReadonlyArray<DecisionPart>
  readonly questions: Questions
}

/** Input accepted by `ai.decision.request` and `generate`. A `DecisionRequest` is also a valid input. */
export interface DecisionRequestInput<
  Model extends DecisionModel = DecisionModel,
  Questions extends DecisionQuestions = DecisionQuestions,
> extends BaseRequest<Model, NoInfer<DecisionModelOptions<Model>>> {
  readonly input: DecisionInput
  readonly questions: Questions
}

/** What decision hosts report; their raw usage stays in the response's `providerMetadata`. */
export class DecisionUsage extends Schema.Class<DecisionUsage>("Decision.Usage")({
  inputTokens: Schema.optional(Schema.Number),
  outputTokens: Schema.optional(Schema.Number),
  totalTokens: Schema.optional(Schema.Number),
  /** USD the host says it charged for this request. */
  cost: Schema.optional(Schema.Number),
}) {}

export class DecisionResponse extends Schema.Class<DecisionResponse>("Decision.Response")({
  answers: Schema.Array(DecisionAnswer),
  usage: Schema.optional(DecisionUsage),
  providerMetadata: Schema.optional(ProviderMetadata),
}) {}

export type DecisionResponseFor<Questions extends DecisionQuestions> = Omit<DecisionResponse, "answers"> & {
  readonly answers: AnswersFor<Questions>
}

// ---------------------------------------------------------------------------
// Call API
// ---------------------------------------------------------------------------

/**
 * 把高层输入规范化为 DecisionRequest：
 * 若 input 是数组就逐项转成 DecisionPart；若是普通 JSON 对象，则包装成一个 json part。
 */
export const request = <const Model extends DecisionModel, const Questions extends DecisionQuestions>(
  input: DecisionRequestInput<Model, Questions>,
): DecisionRequest<Model, Questions> => ({
  ...input,
  input: isParts(input.input) ? input.input.map(decisionPart) : [{ type: "json", value: input.input }],
})

const validate = Schema.decodeUnknownSync(DecisionRequestSchema)

// 用显式类型守卫而不是裸 Array.isArray：后者无法收窄 readonly 数组联合类型，会让对象分支仍保留 parts 类型。
const isParts = (input: DecisionInput): input is ReadonlyArray<DecisionPartInput> => Array.isArray(input)

const decisionPart = (part: DecisionPartInput): DecisionPart => {
  if (part.type !== "media") return part
  const { mediaType, ...rest } = part
  return { ...rest, media: Media.make(part.media, mediaType) }
}

export function generate<const Model extends DecisionModel, const Questions extends DecisionQuestions>(
  input: DecisionRequestInput<Model, Questions>,
): Effect.Effect<DecisionResponseFor<Questions>, AIError, Service>
export function generate(input: DecisionRequestInput) {
  return tryRequest(() => {
    const normalized = request(input)
    // 运行时校验请求合法性（数量/结构），校验失败作为 InvalidRequest 错误抛出
    validate(normalized)
    return normalized
  }).pipe(Effect.flatMap(DecisionClient.generate))
}

export const Decision = {
  request,
  generate,
} as const
