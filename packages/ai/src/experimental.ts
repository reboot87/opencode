/**
 * 实验性 API 的集中导出（可能变动，不保证兼容性）。
 * 目前主要是语音合成与转写相关的类型与客户端。
 */
export { SpeechClient } from "./speech-client.js"
export { SpeechEvent, SpeechModel, SpeechModelSchema, SpeechResponse, SpeechTimestamp, SpeechVoice } from "./speech.js"
export type {
  SpeechFormat,
  SpeechModelOptions,
  SpeechOptions,
  SpeechRequest,
  SpeechRequestInput,
  SpeechRoute,
} from "./speech.js"
export { Speech } from "./speech.js"
export { TranscriptionClient } from "./transcription-client.js"
export {
  TranscriptionEvent,
  TranscriptionModel,
  TranscriptionModelSchema,
  TranscriptionResponse,
  TranscriptionSegment,
  TranscriptionTimestamps,
  TranscriptionWord,
} from "./transcription.js"
export type {
  TranscriptionModelOptions,
  TranscriptionOptions,
  TranscriptionRequest,
  TranscriptionRequestInput,
  TranscriptionRoute,
} from "./transcription.js"
export { Transcription } from "./transcription.js"
export { Extraction, ExtractionModel, ExtractionResponse } from "./experimental/extraction.js"
export type {
  ExtractionAnswerFor,
  ExtractionAnswersFor,
  ExtractionField,
  ExtractionFields,
  ExtractionModelOptions,
  ExtractionOptions,
  ExtractionRequest,
  ExtractionRequestInput,
  ExtractionResponseFor,
  ExtractionRoute,
} from "./experimental/extraction.js"
export { Realtime } from "./experimental/realtime.js"
export type {
  RealtimeConnectInput,
  RealtimeEngine,
  RealtimeSession,
  RealtimeTransport,
  RealtimeTransportInput,
  RealtimeTransportType,
} from "./experimental/realtime.js"
