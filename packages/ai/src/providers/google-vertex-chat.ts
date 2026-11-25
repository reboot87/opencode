/**
 * Google Vertex AI Chat（独立）provider 门面。
 * 以独立入口提供 Vertex 的 chat 能力，复用 Vertex 共享协议与鉴权。
 */
import type { ProviderPackage } from "../provider-package.js"
import { OpenAIChat } from "../protocols/openai-chat.js"
import { Route } from "../route/client.js"
import { Endpoint } from "../route/endpoint.js"
import { ProviderID, type ModelID, type RequestOptions } from "../schema/index.js"
import { GoogleVertexShared } from "./google-vertex-shared.js"
import type { OpenAIProviderOptionsInput } from "./openai-options.js"

export const id = ProviderID.make("google-vertex")

export type Config = RequestOptions &
  GoogleVertexShared.OAuthOptions & {
    readonly baseURL?: string
    readonly location?: string
    readonly project?: string
    readonly providerOptions?: OpenAIProviderOptionsInput
  }

export type Settings = ProviderPackage.Settings &
  OpenAIProviderOptionsInput & {
    readonly accessToken?: string
    readonly apiKey?: never
    readonly baseURL?: string
    readonly location?: string
    readonly project?: string
  }

const route = Route.make({
  id: "google-vertex-chat",
  provider: id,
  providerMetadataKey: "vertex",
  protocol: OpenAIChat.protocol,
  endpoint: Endpoint.path("/chat/completions"),
  framing: OpenAIChat.framing,
})

export const routes = [route]

const configuredRoute = (input: Config) =>
  GoogleVertexShared.oauthRoute(
    route,
    "Chat",
    input,
    (project, location) =>
      `https://aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/endpoints/openapi`,
  )

export const configure = (input: Config = {}) => {
  const route = configuredRoute(input)
  return {
    id,
    model: (modelID: string | ModelID) => route.model<OpenAIProviderOptionsInput>({ id: modelID }),
    configure,
  }
}

export const provider = {
  id,
  configure,
}

export const model: ProviderPackage.Model<Settings, OpenAIProviderOptionsInput> = (modelID, settings = {}) =>
  configure(GoogleVertexShared.oauthSettings<OpenAIProviderOptionsInput>("Chat", settings)).model(modelID)
