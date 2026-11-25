/**
 * 流式响应分帧（Framing）。
 * 位于传输层与协议层之间：把字节流（SSE 或二进制事件流）解码为协议可消费的事件帧，并做错误处理。
 */
import { Effect, Stream } from "effect"
import { makeParser } from "effect/encoding/Sse"
import { AIError, InvalidProviderOutputError } from "../schema/index.js"

/**
 * 把流式 HTTP 响应体解码成 provider 协议帧。
 *
 * Framing 是"传输层与协议层之间、面向字节流"的接缝：
 * - SSE（Framing.sse）：UTF-8 解码响应体，跑 SSE 通道解码器，发出每个非空事件的 data: 载荷。
 *   默认丢弃 [DONE]；把它当终止信号的协议用 sseWithDone。
 * - AWS event stream：带长度前缀和 CRC 校验的二进制帧，每帧是解析后的事件记录。
 * - 媒体流：换行分隔 JSON（lines）、或整个响应体作为一帧（document）；分块二进制无需分帧。
 *
 * 本层不关心帧的具体类型；帧先由协议的事件 schema 解码，再交给状态机处理。
 *
 * 原文：
 * - SSE (`Framing.sse`) — UTF-8 decode the body, run the SSE channel decoder,
 *   and emit the `data:` payload of each non-empty event. The default drops
 *   `[DONE]`; protocols that use it as a terminal select `sseWithDone`.
 * - AWS event stream — length-prefixed binary frames with CRC checksums.
 *   Each emitted frame is one parsed binary event record.
 * - Media streams — newline-delimited JSON (`lines`) or the whole body as one
 *   frame (`document`); chunked binary bodies need no framing.
 *
 * The frame type is opaque to this layer; the protocol's event schema decodes
 * each frame before its state machine handles it.
 */
export interface Definition<Frame> {
  readonly id: string
  readonly frame: (bytes: Stream.Stream<Uint8Array, AIError>) => Stream.Stream<Frame, AIError>
  /** Original wire representation when framing transforms the provider payload. */
  readonly body?: (frame: Frame) => string | undefined
  /** Provider value exposed as a `raw` event when framing adds fields of its own. Defaults to the frame. */
  readonly raw?: (frame: Frame) => unknown
}

/**
 * `framing` step for Server-Sent Events. Decodes UTF-8, runs the SSE channel
 * decoder, optionally filters named events, and drops empty events and known
 * keepalives that proxies send as data. `[DONE]` is dropped by default or
 * retained for protocols that use it as their stream boundary. Retry control events are ignored without
 * interrupting the stream. Decoder failures become provider output errors so
 * the public error channel stays `AIError`.
 */
export const sseFraming = (
  bytes: Stream.Stream<Uint8Array, AIError>,
  events?: ReadonlySet<string>,
  includeDone = false,
): Stream.Stream<string, AIError> =>
  bytes.pipe(
    Stream.decodeText(),
    Stream.mapAccumEffect(
      () => {
        const output: string[] = []
        return {
          output,
          parser: makeParser((event) => {
            if (
              event._tag === "Event" &&
              (events === undefined || events.has(event.event)) &&
              event.data.length > 0 &&
              // Some OpenAI-compatible proxies serialize an empty flush as a bare
              // `data: null`, between events or after `[DONE]`. No protocol has a
              // null event, so it carries nothing and must not abort the stream.
              event.data !== "null" &&
              // Vertex AI partner models (e.g. `xai/grok-4.6`) send their SSE
              // keepalive comment as `data: : keepalive` while reasoning.
              event.data !== ": keepalive" &&
              (event.data !== "[DONE]" || includeDone || (events !== undefined && event.event !== "message"))
            )
              output.push(event.data)
          }),
        }
      },
      (state, chunk) => {
        const error = state.parser.feed(chunk)
        if (!error) return Effect.succeed([state, state.output.splice(0)] as const)
        const reason = new InvalidProviderOutputError({
          route: "sse",
          message: error.message,
          body: chunk,
          cause: error,
        })
        return Effect.fail(new AIError({ reason }))
      },
    ),
  )

/** Server-Sent Events framing. Used by every JSON-streaming HTTP provider. */
export const sse: Definition<string> = { id: "sse", frame: sseFraming }

/** Server-Sent Events framing that retains the conventional `[DONE]` sentinel. */
export const sseWithDone: Definition<string> = {
  id: "sse",
  frame: (bytes) => sseFraming(bytes, undefined, true),
}

/** SSE framing restricted to protocol-recognized event names. */
export const sseEvents = (events: ReadonlySet<string>): Definition<string> => ({
  id: "sse",
  frame: (bytes) => sseFraming(bytes, events),
})

export const lines: Definition<string> = {
  id: "lines",
  frame: (bytes) =>
    bytes.pipe(
      Stream.decodeText(),
      Stream.splitLines,
      Stream.filter((line) => line.trim().length > 0),
    ),
}

export const document: Definition<string> = {
  id: "document",
  frame: (bytes) => Stream.fromEffect(Stream.mkString(bytes.pipe(Stream.decodeText()))),
}

export * as Framing from "./framing.js"
