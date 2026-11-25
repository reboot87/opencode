/**
 * OpenRouter provider 门面。
 * 聚合网关 provider：封装 chat / responses 协议与路由（模型排序、插件、推理预算、图片尺寸档位），并提供 image / video / decision / embedding 模型工厂。
 */
import { Effect, Schema } from "effect"
import { Route } from "../route/client.js"
import { Endpoint } from "../route/endpoint.js"
import { Protocol } from "../route/protocol.js"
import type { ProviderAuthOption } from "../route/auth-options.js"
import {
  mergeTransport,
  ProviderID,
  type ModelID,
  type OpenString,
  type ProviderOptions,
  type RequestOptions,
} from "../schema/index.js"
import type { ProviderPackage } from "../provider-package.js"
import { SystemOne } from "../protocols/system-one.js"
import { OpenAIEmbeddings } from "../protocols/openai-embeddings.js"
import { OpenAIImages, type OpenAIImageSizing } from "../protocols/openai-images.js"
import { OpenRouterVideo } from "../protocols/openrouter-video.js"
import { MediaRoute } from "../route/media.js"
import { HttpTransport } from "../route/transport/index.js"
import { OpenAIChat } from "../protocols/openai-chat.js"
import { OpenResponses } from "../protocols/open-responses.js"
import { cacheControl } from "../protocols/utils/cache.js"
import { isRecord, JsonObject, lenient, ProviderShared } from "../protocols/shared.js"
import type { OpenResponsesProviderOptionsInput } from "./open-responses-options.js"
import { bearerRouteDefaults, toConfig } from "./settings.js"

export type { OpenRouterVideoOptions } from "../protocols/openrouter-video.js"

export const id = ProviderID.make("openrouter")
const baseURL = "https://openrouter.ai/api/v1"
const ADAPTER = "openrouter"

export interface OpenRouterProviderRouting {
  readonly [key: string]: unknown
  readonly order?: ReadonlyArray<string>
  readonly allow_fallbacks?: boolean
  readonly require_parameters?: boolean
  readonly data_collection?: OpenString<"allow" | "deny">
  readonly only?: ReadonlyArray<string>
  readonly ignore?: ReadonlyArray<string>
  readonly quantizations?: ReadonlyArray<string>
  readonly sort?: OpenString<"price" | "throughput" | "latency">
  readonly max_price?: Readonly<{
    prompt?: number | string
    completion?: number | string
    image?: number | string
    audio?: number | string
    request?: number | string
  }>
  readonly zdr?: boolean
}

export type OpenRouterPlugin =
  | Readonly<{
      id: "web"
      max_results?: number
      search_prompt?: string
      engine?: OpenString<"native" | "exa">
    }>
  | Readonly<{ id: "file-parser"; max_files?: number; pdf?: { engine?: string } }>
  | Readonly<{ id: "moderation" }>
  | Readonly<{ id: "response-healing" }>
  | Readonly<{ id: "auto-router"; allowed_models?: ReadonlyArray<string> }>
  | Readonly<{ id: string & {}; [key: string]: unknown }>

export interface OpenRouterOptions {
  readonly [key: string]: unknown
  readonly debug?: Readonly<{ echo_upstream_body?: boolean }>
  readonly models?: ReadonlyArray<string>
  readonly plugins?: ReadonlyArray<OpenRouterPlugin>
  readonly provider?: OpenRouterProviderRouting
  readonly reasoning?: Readonly<{
    enabled?: boolean
    exclude?: boolean
    effort?: OpenString<"none" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max">
    max_tokens?: number
  }>
  readonly usage?: boolean | Readonly<{ include: boolean }>
  readonly user?: string
  readonly web_search_options?: Readonly<{
    max_results?: number
    search_prompt?: string
    engine?: OpenString<"native" | "exa">
  }>
}

export type OpenRouterProviderOptionsInput = OpenRouterOptions

export type OpenRouterResponsesProviderOptionsInput = OpenResponsesProviderOptionsInput &
  Pick<OpenRouterOptions, "debug" | "models" | "plugins" | "provider" | "user">

export interface OpenRouterDecisionOptions {
  readonly [key: string]: unknown
  readonly provider?: OpenRouterProviderRouting
  readonly session_id?: string
  readonly trace?: Readonly<Record<string, unknown>>
  readonly user?: string
}

export interface OpenRouterEmbeddingOptions {
  readonly [key: string]: unknown
  readonly provider?: OpenRouterProviderRouting
  readonly user?: string
}

export type Config = Omit<RequestOptions, "providerOptions"> &
  ProviderAuthOption<"optional"> & {
    readonly baseURL?: string
    readonly providerOptions?: OpenRouterProviderOptionsInput | OpenRouterResponsesProviderOptionsInput
  }

export type Settings<Options = OpenRouterProviderOptionsInput> = ProviderPackage.Settings &
  Options & {
    readonly apiKey?: string | false
    readonly baseURL?: string
  }

const SharedOptions = Schema.Struct({
  models: lenient(Schema.Array(Schema.String)),
  provider: lenient(JsonObject),
  plugins: lenient(Schema.Array(JsonObject)),
  debug: lenient(JsonObject),
  user: lenient(Schema.String),
})

const Options = Schema.Struct({
  ...SharedOptions.fields,
  usage: lenient(Schema.Union([Schema.Boolean, JsonObject])),
  web_search_options: lenient(JsonObject),
  reasoning: lenient(JsonObject),
})
const decodeOptions = Schema.decodeUnknownSync(Options)

const OpenRouterBody = Schema.StructWithRest(
  Schema.Struct({
    ...OpenAIChat.bodyFields,
    ...Options.fields,
    usage: Schema.optional(JsonObject),
  }),
  [JsonObject],
)
export type OpenRouterBody = Schema.Schema.Type<typeof OpenRouterBody>

// Chat 协议：复用 OpenAI Chat 的请求/流式解析，仅在 assist 消息上把 reasoning 内容规整为
// OpenRouter 期望的 reasoning / reasoning_details 字段，并合并 provider 特有选项。
export const protocol = Protocol.make({
  id: "openrouter-chat",
  body: {
    schema: OpenRouterBody,
    from: (request) =>
      OpenAIChat.fromRequest(request, {
        cacheControl: cacheControl(),
        assistant: (source, message) => {
          if (message.role !== "assistant") return message
          const reasoning = source.content
            .filter((part) => part.type === "reasoning")
            .map((part) => part.text)
            .join("")
          const reasoningDetails = Array.isArray(message.reasoning_details) ? message.reasoning_details : undefined
          return {
            ...message,
            reasoning_content: undefined,
            reasoning_text: undefined,
            reasoning: reasoning && reasoningDetails && reasoningDetails.length > 0 ? reasoning : undefined,
            reasoning_details: reasoningDetails,
          }
        },
      }).pipe(Effect.map((body) => bodyOptions(body, request.providerOptions, request.maxTokens))),
  },
  stream: OpenAIChat.protocol.stream,
})

// OpenRouter forwards `reasoning.max_tokens` as the upstream thinking budget. Upstreams such as Anthropic and Alibaba
// reject one that is not below the output limit; 1,024 is Anthropic's minimum budget.
// 把推理预算收敛到输出上限以下：部分上游（Anthropic、阿里）要求预算严格小于 maxTokens，且 Anthropic 最小为 1024。
const fitReasoning = (reasoning: Record<string, unknown>, maxTokens: number | undefined) =>
  typeof reasoning.max_tokens === "number"
    ? { ...reasoning, max_tokens: ProviderShared.fitThinkingBudget(reasoning.max_tokens, maxTokens, 1_024) }
    : reasoning

const bodyOptions = (body: OpenAIChat.OpenAIChatBody, input: unknown, maxTokens: number | undefined) => {
  const openrouter = isRecord(input) ? input : {}
  const options = Object.fromEntries(
    Object.entries(openrouter).filter(([key]) => !(key in Options.fields) && key !== "promptCacheKey"),
  )
  const known = decodeOptions(openrouter)
  const usage =
    openrouter.usage === undefined || known.usage === true
      ? { include: true }
      : known.usage === false
        ? { include: false }
        : known.usage
  return {
    ...options,
    ...body,
    ...(usage !== undefined ? { usage } : {}),
    ...sharedOptions(known),
    ...(known.web_search_options !== undefined ? { web_search_options: known.web_search_options } : {}),
    ...(known.reasoning !== undefined ? { reasoning: fitReasoning(known.reasoning, maxTokens) } : {}),
  }
}

const IMAGE_RESOLUTIONS = new Set(["512", "768", "1K", "1.5K", "2K", "4K"])

// A pixel `size` renders at the upstream's own tier (Gemini 2K comes back as 4K) and FLUX 3 rejects it, so sizing goes
// out as an aspect ratio and a resolution tier. Values OpenRouter doesn't list are left out.
// 图片尺寸以「宽高比 + 分辨率档位」下发，而非像素尺寸：像素尺寸会被上游按自己的档位重映射（如 Gemini 2K 变 4K）。
// 只保留 OpenRouter 明确支持的档位，其余省略交由上游默认。
const imageSizing: OpenAIImageSizing = (request) => {
  const resolution = request.resolution
    ?.toUpperCase()
    .replace(/^0\.5K$/, "512")
    .replace(/^0\.75K$/, "768")
  return {
    aspect_ratio: request.aspect,
    resolution: resolution !== undefined && IMAGE_RESOLUTIONS.has(resolution) ? resolution : undefined,
  }
}

const sharedOptions = (known: typeof SharedOptions.Type) => ({
  ...(known.models !== undefined ? { models: known.models } : {}),
  ...(known.provider !== undefined ? { provider: known.provider } : {}),
  ...(known.plugins !== undefined ? { plugins: known.plugins } : {}),
  ...(known.debug !== undefined ? { debug: known.debug } : {}),
  ...(known.user !== undefined ? { user: known.user } : {}),
})

const OpenRouterResponsesBody = Schema.Struct({
  ...OpenResponses.OpenResponsesBody.fields,
  ...SharedOptions.fields,
})
type OpenRouterResponsesBody = Schema.Schema.Type<typeof OpenRouterResponsesBody>

const responsesProtocol = Protocol.make({
  id: "openrouter-responses",
  body: {
    schema: OpenRouterResponsesBody,
    from: (request) =>
      OpenResponses.fromRequest(request).pipe(
        Effect.map((body) => ({ ...body, ...sharedOptions(decodeOptions(request.providerOptions ?? {})) })),
      ),
  },
  stream: OpenResponses.protocol.stream,
})

export const route = Route.make({
  id: ADAPTER,
  provider: id,
  providerMetadataKey: "openrouter",
  protocol,
  endpoint: Endpoint.path("/chat/completions", { baseURL }),
  framing: OpenAIChat.framing,
})

const responsesRoute = Route.make({
  id: "openrouter-responses",
  provider: id,
  providerMetadataKey: "openrouter",
  protocol: responsesProtocol,
  endpoint: Endpoint.path("/responses", { baseURL }),
  transport: HttpTransport.sseJson.with<OpenRouterResponsesBody>(),
  options: { providerOptions: { store: false, include: ["reasoning.encrypted_content"] } },
})

export const routes = [route, responsesRoute]

// 核心工厂：构建 chat / responses 路由及 image / video / decision / embedding 各模态模型工厂。
// 聚合网关特有的 provider 路由（模型排序、插件、推理预算）通过 providerOptions 透传。
export const configure = (input: Config = {}) => {
  const options = bearerRouteDefaults(input, "OPENROUTER_API_KEY", baseURL)
  const chatRoute = route.with(options)
  const configuredResponses = responsesRoute.with(options)
  const decisionRoute = SystemOne.route.with({
    provider: id,
    providerMetadataKey: "openrouter",
    endpoint: options.endpoint,
    auth: options.auth,
    ...mergeTransport(input),
  })
  const media = MediaRoute.deployment({ ...input, baseURL: options.endpoint.baseURL }, options.auth)
  const image = (modelID: string | ModelID, providerOptions?: ProviderOptions) =>
    OpenAIImages.model({
      ...media,
      id: modelID,
      provider: id,
      providerOptions,
      sizing: imageSizing,
      imageInput: "references",
    })
  const video = (modelID: string | ModelID, providerOptions?: ProviderOptions) =>
    OpenRouterVideo.model({ ...media, id: modelID, providerOptions })
  const decision = (modelID: string | ModelID, providerOptions?: ProviderOptions) =>
    decisionRoute.model<OpenRouterDecisionOptions>({
      id: modelID,
      compatibility: { mediaInput: "state" },
      providerOptions,
    })
  const embeddingRoute = OpenAIEmbeddings.route.with({
    provider: id,
    endpoint: options.endpoint,
    auth: options.auth,
    ...mergeTransport(input),
  })
  const embedding = (modelID: string | ModelID, providerOptions?: ProviderOptions) =>
    embeddingRoute.model<OpenRouterEmbeddingOptions>({ id: modelID, providerOptions })
  const chat = (modelID: string | ModelID) =>
    chatRoute.model<OpenRouterProviderOptionsInput>({ id: modelID, capabilities: { promptCacheKey: true } })
  return {
    id,
    model: chat,
    chat,
    responses: (modelID: string | ModelID) =>
      configuredResponses.model<OpenRouterResponsesProviderOptionsInput>({ id: modelID }),
    image,
    video,
    decision,
    embedding,
    configure,
  }
}

export const provider = configure()
export const decision = provider.decision
export const embedding = provider.embedding
export const image = provider.image
export const video = provider.video
export const chat = provider.chat
export const responses = provider.responses
export const model: ProviderPackage.Model<Settings, OpenRouterProviderOptionsInput> = (modelID, settings) =>
  configure(toConfig(settings)).model(modelID)
export const responsesModel: ProviderPackage.Model<
  Settings<OpenRouterResponsesProviderOptionsInput>,
  OpenRouterResponsesProviderOptionsInput
> = (modelID, settings) => configure(toConfig(settings)).responses(modelID)
export const imageModel = (modelID: string, settings?: Settings) => {
  const input = toConfig(settings)
  return configure(input).image(modelID, input.providerOptions)
}
export const videoModel = (modelID: string, settings?: Settings) => {
  const input = toConfig(settings)
  return configure(input).video(modelID, input.providerOptions)
}
export const decisionModel = (modelID: string, settings?: Settings) => {
  const input = toConfig(settings)
  return configure(input).decision(modelID, input.providerOptions)
}

export const embeddingModel = (modelID: string, settings?: Settings) => {
  const input = toConfig(settings)
  return configure(input).embedding(modelID, input.providerOptions)
}

export * as OpenRouter from "./openrouter.js"
