/**
 * 媒体客户端的通用基类服务。
 *
 * 图片/语音/视频等异步媒体任务共享一套接口：generate（等待并取结果）、stream（进度 + 结果事件流）、
 * start（返回 Generation 句柄）、resume（从序列化 token 恢复任务）。
 * 具体实现依赖 MediaRoute 和 RequestExecutor；内联/流式路由不支持 start/resume（报 UnsupportedOperation）。
 * 各模态 client 通过继承这里定义的 Interface / Layer 复用这套逻辑。
 */
import { type Context, Effect, Layer, Stream } from "effect"
import { resultEvents, type AwaitOptions, type Generation, type Observation } from "./generation.js"
import { RequestExecutor } from "./route/executor.js"
import type { MediaRoute } from "./route/media.js"
import { AIError, UnsupportedOperationError, type ProviderID } from "./schema/index.js"

/** 一种媒体请求：其 model 自带执行它的 route。 */
export interface RoutedRequest<Self extends MediaRoute.MediaRequest, Event, Response> extends MediaRoute.MediaRequest {
  readonly model: MediaRoute.MediaRequest["model"] & { readonly route: MediaRoute.AnyRoute<Self, Event, Response> }
}

/** 媒体客户端接口；内联和流式路由上 start / resume 会以 UnsupportedOperation 失败。 */
export interface Interface<Req extends RoutedRequest<Req, Event, Response>, Event, Response> {
  readonly generate: (request: Req, options?: AwaitOptions) => Effect.Effect<Response, AIError>
  readonly stream: (request: Req, options?: AwaitOptions) => Stream.Stream<Event | Observation, AIError>
  readonly start: (request: Req) => Effect.Effect<Generation<Response>, AIError>
  readonly resume: (model: Req["model"], token: unknown) => Effect.Effect<Generation<Response>, AIError>
}

export interface Input<Event, Response> {
  readonly modality: string
  /** A completed response expanded into the streaming event shape. */
  readonly responseEvents: (response: Response) => ReadonlyArray<Event>
}

/** `${modality}.${operation}` on a route that is not queued. */
export const notQueued = (
  modality: string,
  route: { readonly provider: ProviderID; readonly id: string },
  operation: string,
) =>
  new AIError({
    reason: new UnsupportedOperationError({
      operation: `${modality}.${operation}`,
      provider: route.provider,
      route: route.id,
      message: `${route.provider}/${route.id} is not a queued route; use generate or stream`,
    }),
  })

/** One modality's operations over an executor, dispatching each request on its route's `kind`. */
export const operations = <Req extends RoutedRequest<Req, Event, Response>, Event, Response>(
  execute: MediaRoute.Execute,
  input: Input<Event, Response>,
): Interface<Req, Event, Response> => {
  const start = (request: Req) => {
    const route = request.model.route
    if (route.kind !== "queued") return Effect.fail(notQueued(input.modality, route, "start"))
    return route.start(request, execute)
  }
  return {
    start,
    resume: (model, token) => {
      if (model.route.kind !== "queued") return Effect.fail(notQueued(input.modality, model.route, "resume"))
      return model.route.resume(model, token, execute)
    },
    generate: (request, options) => {
      const route = request.model.route
      if (route.kind !== "queued") return route.generate(request, execute)
      return start(request).pipe(Effect.flatMap((generation) => generation.await(options)))
    },
    stream: (request, options) => {
      const route = request.model.route
      if (route.kind === "stream") return route.stream(request, execute)
      if (route.kind === "queued")
        return Stream.unwrap(
          start(request).pipe(Effect.map((generation) => resultEvents(generation, input.responseEvents, options))),
        )
      return Stream.fromIterableEffect(Effect.map(route.generate(request, execute), input.responseEvents))
    },
  }
}

/** One modality's layer and service accessors over `operations`. */
export const make = <Self, Req extends RoutedRequest<Req, Event, Response>, Event, Response>(
  service: Context.Service<Self, Interface<Req, Event, Response>>,
  input: Input<Event, Response>,
) => ({
  responseEvents: input.responseEvents,
  layer: Layer.effect(
    service,
    Effect.gen(function* () {
      const executor = yield* RequestExecutor.Service
      return service.of(operations<Req, Event, Response>(executor.execute, input))
    }),
  ),
  generate: (request: Req, options?: AwaitOptions) => service.use((client) => client.generate(request, options)),
  stream: (request: Req, options?: AwaitOptions) =>
    Stream.unwrap(service.useSync((client) => client.stream(request, options))),
  start: (request: Req) => service.use((client) => client.start(request)),
  resume: (model: Req["model"], token: unknown) => service.use((client) => client.resume(model, token)),
})

export * as MediaClient from "./media-client.js"
