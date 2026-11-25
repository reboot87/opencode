/**
 * 媒体资产（Media Asset）抽象。
 *
 * 图片、音频、视频、文档等媒体在各 provider 间有不同的表示形式，
 * 本文件把它们统一成 Asset：一个带 source（来源）和 mediaType 的对象。
 *
 * 核心概念：
 *   - Source：可序列化/可持久化的来源形式——bytes（原始字节）、base64、url（带过期时间）、ref（provider 引用）；
 *   - Asset 类：围绕 Source 提供一致的访问接口，如取字节、取 URL、转 data URL、写文件；
 *   - Schema：AssetEncoded / AssetSchema 让 Asset 能跨进程传递（AI SDK 常在多进程/流式场景运行）；
 *   - 便捷构造器：image / bytes / base64 / url / ref / file / parseDataUrl 等。
 *
 * 设计要点：媒体内容可能很大，Asset 尽量延迟加载（url/ref 不立即下载），并在需要时通过 Effect 获取。
 */
export * as Media from "./media.js"

import { Effect, FileSystem, Result, Schema, SchemaGetter, Stream } from "effect"
import { Base64 } from "effect/encoding"
import { HttpClientRequest } from "effect/http"
import { ProviderID } from "./schema/ids.js"
import { AIError, InvalidRequestError } from "./schema/errors.js"
import { ProviderMetadata } from "./schema/options.js"
import {
  CurrentMiddleware,
  type HttpMiddleware,
  responseBytes,
  responseStream,
  Service,
} from "./route/executor-service.js"
import { detectMediaType, fileMediaType } from "./utils/media-type.js"

export { detectMediaType } from "./utils/media-type.js"

const OCTET_STREAM = "application/octet-stream"

// ---------------------------------------------------------------------------
// Source — the serializable wire/persistence form of a media asset
// ---------------------------------------------------------------------------

const BytesSource = Schema.Struct({
  type: Schema.Literal("bytes"),
  data: Schema.Uint8Array,
  mediaType: Schema.String,
})

const Base64Source = Schema.Struct({
  type: Schema.Literal("base64"),
  data: Schema.String,
  mediaType: Schema.String,
})

const UrlSource = Schema.Struct({
  type: Schema.Literal("url"),
  url: Schema.String,
  mediaType: Schema.optional(Schema.String),
  /** URL 失效的 epoch 毫秒时间戳：过了这个时间 provider 不再提供该 URL。 */
  expiresAt: Schema.optional(Schema.Number),
})

/** provider 侧的引用句柄：如 OpenAI 的 file_id、Gemini 文件 URI、gs:// 地址或上一次生成的 id。 */
const RefSource = Schema.Struct({
  type: Schema.Literal("ref"),
  provider: ProviderID,
  id: Schema.String,
  mediaType: Schema.optional(Schema.String),
})

export const Source = Schema.Union([BytesSource, Base64Source, UrlSource, RefSource])
  .pipe(Schema.toTaggedUnion("type"))
  .annotate({ identifier: "Media.Source" })
export type Source = Schema.Schema.Type<typeof Source>

// ---------------------------------------------------------------------------
// Kind, Info
// ---------------------------------------------------------------------------

export type AspectRatio = `${number}:${number}`
export const AspectRatio = Schema.declare<AspectRatio>(
  (value): value is AspectRatio => typeof value === "string" && /^\d+(?:\.\d+)?:\d+(?:\.\d+)?$/.test(value),
  { title: "Media.AspectRatio" },
)

export const Kind = Schema.Literals(["image", "video", "audio", "document", "other"])
export type Kind = Schema.Schema.Type<typeof Kind>

export const kindOf = (mediaType: string): Kind => {
  const lower = mediaType.toLowerCase()
  if (lower.startsWith("image/")) return "image"
  if (lower.startsWith("video/")) return "video"
  if (lower.startsWith("audio/")) return "audio"
  if (lower === "application/pdf" || lower.startsWith("text/")) return "document"
  return "other"
}

/**
 * 与容器无关的有效载荷元数据（宽高、时长、采样率等）。
 * 原始 PCM 音频没有文件头，必须依赖这些字段才能知道如何解析。
 */
export const Info = Schema.Struct({
  width: Schema.optional(Schema.Number),
  height: Schema.optional(Schema.Number),
  durationSeconds: Schema.optional(Schema.Number),
  sampleRate: Schema.optional(Schema.Number),
  channels: Schema.optional(Schema.Number),
  encoding: Schema.optional(Schema.String),
  format: Schema.optional(Schema.String),
}).annotate({ identifier: "Media.Info" })
export type Info = Schema.Schema.Type<typeof Info>

// ---------------------------------------------------------------------------
// Asset
// ---------------------------------------------------------------------------

const invalid = (message: string, cause?: unknown) =>
  new AIError({ reason: new InvalidRequestError({ message, cause }) })

/** Synchronous view of an inline payload; `undefined` for `url` and `ref` sources, which carry no local bytes. */
export interface Inline {
  readonly mime: string
  readonly base64: string
  readonly dataUrl: string
}

/** 一个媒体资产对象：持有 Source 并派生出类型、种类等元信息，提供统一的读取接口。 */
export class Asset {
  readonly source: Source
  /** 媒体类型按优先级派生：source 声明的类型 → 嗅探魔数 → application/octet-stream。 */
  readonly mediaType: string
  readonly kind: Kind
  readonly info?: Info
  /** url 来源失效的 epoch 毫秒时间戳。 */
  readonly expiresAt?: number
  readonly providerMetadata?: ProviderMetadata
  /** url 来源的临时下载凭据（如签名 header）。 */
  readonly headers?: Record<string, string>
  /** 下载 url 来源时使用的 HTTP 中间件。 */
  readonly middleware?: HttpMiddleware

  // 派生出的载荷形式缓存在实例上，因为每个协议的降级处理都会重复读取同一份载荷。
  // 缓存是“先检查后设置”（url 首次并发读取时可能都去下载），且不会通过 source 暴露，
  // 所以用 Media.from(asset.source) 往返转换仍然无损。
  #bytes: Uint8Array | undefined
  #base64: string | undefined

  constructor(input: Asset.Input) {
    this.source = input.source
    this.mediaType =
      input.source.mediaType ??
      (input.source.type === "bytes" ? detectMediaType(input.source.data) : undefined) ??
      OCTET_STREAM
    this.kind = kindOf(this.mediaType)
    this.info = input.info
    this.expiresAt = input.source.type === "url" ? input.source.expiresAt : undefined
    this.providerMetadata = input.providerMetadata
    this.headers = input.source.type === "url" ? input.headers : undefined
    this.middleware = input.source.type === "url" ? input.middleware : undefined
  }

  /** 同步取得内联载荷（base64 / data URL），供直接嵌入 base64 的协议使用；url/ref 来源返回 undefined。 */
  inline(): Inline | undefined {
    const source = this.source
    if (source.type !== "bytes" && source.type !== "base64") return undefined
    const base64 = source.type === "base64" ? source.data : (this.#base64 ??= Base64.encode(source.data))
    const mime = this.mediaType.toLowerCase()
    return { mime, base64, dataUrl: `data:${mime};base64,${base64}` }
  }

  /** 解码后的字节载荷；url 来源会通过请求执行器下载并缓存结果，ref 来源无法本地化会报错。 */
  bytes(): Effect.Effect<Uint8Array, AIError, Service> {
    return Effect.suspend(() => {
      const source = this.source
      if (source.type === "bytes") return Effect.succeed(source.data)
      if (this.#bytes !== undefined) return Effect.succeed(this.#bytes)
      if (source.type === "ref")
        return Effect.fail(invalid(`Cannot materialize provider ref ${source.provider}:${source.id}`))
      const decoded =
        source.type === "base64"
          ? Effect.fromResult(Base64.decode(source.data)).pipe(
              Effect.mapError((cause) => invalid(`Media asset contains invalid base64 data`, cause)),
            )
          : download(source, this.headers, this.middleware)
      return decoded.pipe(Effect.tap((data) => Effect.sync(() => (this.#bytes = data))))
    })
  }

  /** The payload as a byte stream; `url` sources stream from the network without being buffered or cached. */
  stream(): Stream.Stream<Uint8Array, AIError, Service> {
    const source = this.source
    if (source.type !== "url" || this.#bytes !== undefined) return Stream.fromEffect(this.bytes())
    return Stream.unwrap(downloadStream(source, this.headers, this.middleware))
  }

  base64(): Effect.Effect<string, AIError, Service> {
    return Effect.suspend(() => {
      const source = this.source
      if (source.type === "base64") return Effect.succeed(source.data)
      if (this.#base64 !== undefined) return Effect.succeed(this.#base64)
      return this.bytes().pipe(Effect.map((data) => (this.#base64 = Base64.encode(data))))
    })
  }

  dataUrl(): Effect.Effect<string, AIError, Service> {
    return this.base64().pipe(Effect.map((data) => `data:${this.mediaType};base64,${data}`))
  }

  /**
   * The `AssetEncoded` JSON form with `bytes` sources as base64, matching `Schema.toCodecJson(AssetSchema)`, so a
   * plain `JSON.stringify` of messages or events stays lossless and decodes back through the JSON codec.
   */
  toJSON() {
    const source = this.source
    return {
      source: source.type === "bytes" ? { ...source, data: Base64.encode(source.data) } : source,
      info: this.info,
      providerMetadata: this.providerMetadata,
    }
  }

  /** Pull `url` sources into owned bytes before the URL expires. Inline sources return themselves. */
  materialize(): Effect.Effect<Asset, AIError, Service> {
    if (this.source.type === "bytes" || this.source.type === "base64") return Effect.succeed(this)
    return this.bytes().pipe(
      Effect.map((data) =>
        bytes(data, this.source.mediaType, { info: this.info, providerMetadata: this.providerMetadata }),
      ),
    )
  }
}

export namespace Asset {
  export interface Input {
    readonly source: Source
    readonly info?: Info
    readonly providerMetadata?: ProviderMetadata
    /**
     * Headers required to download a `url` source, such as a provider API key.
     * They are runtime-only: never part of `source`, `toJSON()`, or `AssetSchema`, so a persisted asset cannot leak
     * credentials and cannot be downloaded again after a round-trip. Call `materialize()` before persisting.
     */
    readonly headers?: Record<string, string>
    /**
     * Middleware for downloading a `url` source, runtime-only like `headers`. A download never uses the caller's
     * scoped middleware (`RequestExecutor.withMiddleware`), so hooks that add provider credentials can't reach another
     * host. Routes set this to that middleware only for result URLs on the provider's origin.
     */
    readonly middleware?: HttpMiddleware
  }
}

/** JSON form of an asset: the serializable `Source` plus caller-supplied metadata. `bytes` sources encode as base64. */
export const AssetEncoded = Schema.Struct({
  source: Source,
  info: Schema.optional(Info),
  providerMetadata: Schema.optional(ProviderMetadata),
}).annotate({ identifier: "Media.AssetEncoded" })

const encodeAsset = (asset: Asset): typeof AssetEncoded.Type => ({
  source: asset.source,
  info: asset.info,
  providerMetadata: asset.providerMetadata,
})

const AssetInstance = Schema.declare((value): value is Asset => value instanceof Asset, {
  expected: "Media.Asset",
})

/** `Asset` in the type domain and `AssetEncoded` on the wire, so messages and events holding assets serialize. */
export const AssetSchema = AssetEncoded.pipe(
  Schema.decodeTo(AssetInstance, {
    decode: SchemaGetter.transform((encoded) => new Asset(encoded)),
    encode: SchemaGetter.transform(encodeAsset),
  }),
)

/**
 * An image, or a URL or provider file reference whose type it doesn't state, which the provider checks itself. Build one with
 * `Media.image`; an asset known to be a video, audio or document is rejected.
 */
export const ImageAssetSchema = AssetInstance.check(
  Schema.makeFilter(
    (asset) =>
      asset.kind === "image" ||
      ((asset.source.type === "url" || asset.source.type === "ref") && asset.source.mediaType === undefined) ||
      `expected an image, got ${asset.mediaType}`,
  ),
).pipe(Schema.brand("Media.ImageAsset"))
export type ImageAsset = typeof ImageAssetSchema.Type

const download = Effect.fn("Media.download")(function* (
  source: Extract<Source, { readonly type: "url" }>,
  headers: Record<string, string> | undefined,
  middleware: HttpMiddleware | undefined,
) {
  const executor = yield* Service
  const response = yield* executor
    .execute(HttpClientRequest.get(source.url).pipe(HttpClientRequest.setHeaders(headers ?? {})))
    .pipe(Effect.provideService(CurrentMiddleware, middleware))
  return yield* responseBytes(response)
})

const downloadStream = Effect.fn("Media.downloadStream")(function* (
  source: Extract<Source, { readonly type: "url" }>,
  headers: Record<string, string> | undefined,
  middleware: HttpMiddleware | undefined,
) {
  const executor = yield* Service
  const response = yield* executor
    .execute(HttpClientRequest.get(source.url).pipe(HttpClientRequest.setHeaders(headers ?? {})))
    .pipe(Effect.provideService(CurrentMiddleware, middleware))
  return responseStream(response)
})

// ---------------------------------------------------------------------------
// Constructors
// ---------------------------------------------------------------------------

export type AssetOptions = Omit<Asset.Input, "source">

export const from = (source: Source, options?: AssetOptions) => new Asset({ ...options, source })

export const bytes = (data: Uint8Array, mediaType?: string, options?: AssetOptions) =>
  from({ type: "bytes", data, mediaType: mediaType ?? detectMediaType(data) ?? OCTET_STREAM }, options)

export const base64 = (data: string, mediaType: string, options?: AssetOptions) =>
  from({ type: "base64", data, mediaType }, options)

export const url = (
  value: string,
  options?: AssetOptions & Omit<Extract<Source, { readonly type: "url" }>, "type" | "url">,
) => {
  const { mediaType, expiresAt, ...rest } = options ?? {}
  return from({ type: "url", url: value, mediaType, expiresAt }, rest)
}

export const ref = (provider: string | ProviderID, id: string, mediaType?: string, options?: AssetOptions) =>
  from({ type: "ref", provider: ProviderID.make(provider), id, mediaType }, options)

const DATA_URL = /^data:([^;,]+)(?:;[^,]*)*;base64,(.*)$/is

/** 解析 data URL（data:<mime>;base64,<data>）；不是 base64 data URL 时返回 undefined。 */
export const parseDataUrl = (value: string, options?: AssetOptions) => {
  const match = DATA_URL.exec(value)
  return match === null ? undefined : base64(match[2], match[1], options)
}

/** 解析 data URL；格式非法时抛出类型化的 AIError（因为构造函数是同步的）。 */
export const fromDataUrl = (dataUrl: string, options?: AssetOptions) => {
  const asset = parseDataUrl(dataUrl, options)
  if (asset === undefined) throw invalid("Media data URLs must contain a MIME type and base64 data")
  return asset
}

/** 普通文件数据：字节、URL，或表示 data URL / http(s) URL / base64 的字符串。 */
export type Data = Uint8Array | ArrayBuffer | URL | string

/** 文件输入接受的类型：Asset 或普通 Data。 */
export type Input = Asset | Data

/** 把输入规范化成 ImageAsset；确定不是图片时抛错。 */
export const image = (input: Input, mediaType?: string): ImageAsset => {
  const asset = make(input, mediaType)
  if (!Schema.is(ImageAssetSchema)(asset)) throw invalid(`expected an image, got ${asset.mediaType}`)
  return asset
}

/**
 * Normalize file input into an `Asset`. Data URLs carry their media type and bytes or base64 are sniffed from magic
 * bytes; `mediaType` is required when sniffing fails. Assets pass through unchanged.
 */
export const make = (input: Input, mediaType?: string): Asset => {
  if (input instanceof Asset) return input
  if (input instanceof ArrayBuffer) return make(new Uint8Array(input), mediaType)
  if (input instanceof Uint8Array) return bytes(input, mediaType ?? requireMediaType(detectMediaType(input)))
  const value = input instanceof URL ? input.href : input
  if (/^data:/i.test(value)) {
    const match = DATA_URL.exec(value)
    if (match === null) throw invalid("Media data URLs must contain a MIME type and base64 data")
    return base64(match[2], mediaType ?? match[1])
  }
  if (input instanceof URL || /^https?:\/\//i.test(value)) return url(value, { mediaType })
  if (!BASE64.test(value))
    throw invalid("Media strings must be base64, a data URL or an http(s) URL; read files with Media.file")
  return base64(value, mediaType ?? requireMediaType(sniffBase64(value)))
}

const BASE64 = /^[A-Za-z0-9+/\-_\s]*={0,2}\s*$/

// 64 characters decode to 48 bytes, enough for every signature `detectMediaType` reads.
const sniffBase64 = (value: string) => {
  const head = Result.getOrUndefined(Base64.decode(value.slice(0, 64)))
  return head === undefined ? undefined : detectMediaType(head)
}

const requireMediaType = (detected: string | undefined) => {
  if (detected === undefined) throw invalid("Media data needs a mediaType because its type cannot be detected")
  return detected
}

/** Read a file through `FileSystem` and sniff its media type from magic bytes, then the extension. */
export const file = (path: string, options?: AssetOptions): Effect.Effect<Asset, AIError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const data = yield* fs
      .readFile(path)
      .pipe(Effect.mapError((cause) => invalid(`Failed to read media file ${path}`, cause)))
    return bytes(data, fileMediaType(data, path), options)
  })

/**
 * Stream an asset's bytes into a file through `FileSystem` without buffering `url` downloads. The bytes go to a temporary
 * file next to `path` that replaces it only once the download finished, so a failed download leaves an existing file as
 * it was.
 */
export const write = (asset: Asset, path: string): Effect.Effect<void, AIError, FileSystem.FileSystem | Service> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const temporary = `${path}.${crypto.randomUUID()}.tmp`
    yield* asset.stream().pipe(
      Stream.run(fs.sink(temporary)),
      Effect.andThen(fs.rename(temporary, path)),
      Effect.onError(() => fs.remove(temporary).pipe(Effect.ignore)),
      Effect.mapError((cause) =>
        cause instanceof AIError ? cause : invalid(`Failed to write media file ${path}`, cause),
      ),
    )
  })
