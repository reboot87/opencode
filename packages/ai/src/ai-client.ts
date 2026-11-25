/**
 * AI 客户端的服务层装配。
 * layerWith 把各模态的 Client（LLM / Image / Video / Speech / Transcription / Decision / Embedding）
 * 合并到一个 Effect Layer，并提供一个 RequestExecutor；executor 保留在输出中，
 * 这样 asset.bytes() 和 Media.write 才能解析到下载/写入所需的服务。
 * layer 是默认的、基于 fetchLayer 的成品 Layer，大多数程序直接用它即可。
 */
import { Layer } from "effect"
import { DecisionClient } from "./decision-client.js"
import { EmbeddingClient } from "./embedding-client.js"
import { ImageClient } from "./image-client.js"
import { LLMClient } from "./route/client.js"
import { RequestExecutor } from "./route/executor.js"
import { SpeechClient } from "./speech-client.js"
import { TranscriptionClient } from "./transcription-client.js"
import { VideoClient } from "./video-client.js"

/** 在给定 executor 之上装配所有模态客户端；executor 保留在输出中供 asset.bytes() / Media.write 使用。 */
export const layerWith = <E, R>(executor: Layer.Layer<RequestExecutor.Service, E, R>) =>
  Layer.mergeAll(
    LLMClient.layer,
    ImageClient.layer,
    VideoClient.layer,
    SpeechClient.layer,
    TranscriptionClient.layer,
    DecisionClient.layer,
    EmbeddingClient.layer,
  ).pipe(Layer.provideMerge(executor))

/** Every modality client plus the executor over `RequestExecutor.fetchLayer`: the one layer most programs need. */
export const layer = layerWith(RequestExecutor.fetchLayer)

export type Services = Layer.Success<typeof layer>

export * as AIClient from "./ai-client.js"
