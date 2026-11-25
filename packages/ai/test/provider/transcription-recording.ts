/**
 * 语音转写·录制的测试辅助模块。
 *
 * 被测模块：@opencode/ai/provider/transcription-recording
 *
 * 覆盖各家供应商的接入实现：请求构造、响应解析与错误映射。
 */
import type { HttpRecorder } from "@opencode/http-recorder"
import { Effect } from "effect"
import { Media } from "../../src/effect.js"

const fixture = (name: string) =>
  Effect.promise(() => Bun.file(new URL(`../fixtures/audio/${name}`, import.meta.url)).bytes()).pipe(
    Effect.map((bytes) => Media.bytes(bytes, "audio/mpeg")),
  )

/** "Hello from OpenCode." spoken by Deepgram Aura (`aura-2-thalia-en`, 32 kbps MP3). */
export const audio = fixture("hello.mp3")

/** "Did the release ship?" (`aura-2-thalia-en`), then "Yes, it shipped this morning." (`aura-2-orion-en`). */
export const dialog = fixture("dialog.mp3")

/** Providers disagree on "OpenCode" versus "Open Code" and on the final punctuation. */
export const TRANSCRIPT = /^hello,? from open ?code[.!]?$/i

/**
 * Request bodies are snapshotted as text, so the audio would be stored as mangled UTF-8. Replace it with a marker and
 * pin the random multipart boundary, which keeps the remaining form fields and query checked on replay.
 */
const redactAudio = (body: string) => {
  const boundary = /^--(\S+)\r\n/.exec(body)?.[1]
  if (boundary === undefined) return body.includes("\uFFFD") ? "[audio]" : body
  return body
    .replaceAll(boundary, "BOUNDARY")
    .replace(/(filename="[^"]*"\r\nContent-Type: [^\r]*\r\n\r\n)[\s\S]*?(\r\n--BOUNDARY)/, "$1[audio]$2")
}

const contentType = (snapshot: HttpRecorder.RequestSnapshot) =>
  snapshot.headers["content-type"]?.replace(/boundary=.*/, "")

export const audioRecording: HttpRecorder.RecorderOptions = {
  redact: { body: redactAudio },
  match: (incoming, recorded) =>
    incoming.method === recorded.method &&
    incoming.url === recorded.url &&
    contentType(incoming) === contentType(recorded) &&
    incoming.body === recorded.body,
}
