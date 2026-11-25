/**
 * Cartesia provider 门面。
 * 语音合成（TTS）provider，支持字节流与 SSE 两种传输，提供 speech 模型工厂。
 */
import { AuthOptions, type ProviderAuthOption } from "../route/auth-options.js"
import { MediaRoute } from "../route/media.js"
import { ProviderID, type ModelID, type TransportOptions } from "../schema/index.js"
import { CartesiaSpeech } from "../protocols/cartesia-speech.js"

export type { CartesiaEncoding, CartesiaSpeechOptions } from "../protocols/cartesia-speech.js"

export const id = ProviderID.make("cartesia")

export type Config = TransportOptions &
  ProviderAuthOption<"optional"> & {
    readonly baseURL?: string
  }

const auth = (options: ProviderAuthOption<"optional">) => AuthOptions.bearer(options, "CARTESIA_API_KEY")

export const configure = (input: Config = {}) => {
  const media = MediaRoute.deployment(input, auth(input))
  const speech = (modelID: string | ModelID) => CartesiaSpeech.model({ ...media, id: modelID })
  return {
    id,
    speech,
    configure,
  }
}

export const provider = configure()
export const speech = provider.speech
