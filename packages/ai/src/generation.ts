/**
 * 异步生成任务（Generation）的轮询抽象。
 *
 * 图片/语音/视频等媒体生成往往是异步的：提交后拿到一个任务，需要反复查询状态直到完成。
 * 本文件把这一类任务统一建模为 Generation：
 *   - Snapshot： provider 无关的状态快照（running / completed / error + 进度）；
 *   - Route：具体 provider 提供的 status / result / cancel 操作（把 token 形状藏在闭包里）；
 *   - Generation 类：在此之上提供 refresh / await / events / cancel 等高层操作。
 *
 * 核心价值：把“轮询直到终态 + 超时控制 + 流式进度事件”这套通用逻辑抽出来，
 * 各媒体模块只需提供自己的 Route 即可，不必重复实现轮询与超时。
 */
import { Clock, Duration, Effect, Schedule, Schema, Stream } from "effect"
import { AIError, TimeoutError } from "./schema/errors.js"

/** 生成任务状态：运行中 / 已完成 / 出错。 */
export const Status = Schema.Literals(["running", "completed", "error"])
export type Status = Schema.Schema.Type<typeof Status>

/** 任务进入 error 状态的具体原因：失败 / 被取消 / 已过期。 */
export const Reason = Schema.Literals(["failed", "cancelled", "expired"])
export type Reason = Schema.Schema.Type<typeof Reason>

/** provider 无关的一次任务状态快照。 */
export interface Snapshot {
  readonly id: string
  readonly status: Status
  /** 仅当 status 为 error 时设置。 */
  readonly reason?: Reason
  /** provider 上报进度时，为 0..1 的归一化值。 */
  readonly progress?: number
}

/**
 * Route-owned generation operations for one generation. The media route decodes its serializable token once (from the
 * submission response or a `resume` input) and closes over it, so `Generation` never sees the token's shape.
 */
export interface Route<Response> {
  readonly status: Effect.Effect<Snapshot, AIError>
  readonly result: Effect.Effect<Response, AIError>
  readonly cancel?: Effect.Effect<void, AIError>
}

/** 轮询配置：每次查询的间隔、整体超时时间。 */
export interface Poll {
  readonly interval?: Duration.Input
  readonly timeout?: Duration.Input
}

/** await / events 等高层操作的选项，目前只有轮询配置。 */
export interface AwaitOptions {
  readonly poll?: Poll
}

const DEFAULT_POLL_INTERVAL = Duration.seconds(5)
const DEFAULT_POLL_TIMEOUT = Duration.minutes(10)

export const ProgressEvent = Schema.Struct({
  type: Schema.tag("generation-progress"),
  id: Schema.String,
  progress: Schema.optional(Schema.Number),
}).annotate({ identifier: "Generation.Event.Progress" })

export type Observation = Schema.Schema.Type<typeof ProgressEvent>

export type Event =
  | Observation
  | {
      readonly type: "generation-finished"
      readonly id: string
      readonly status: Status
      readonly reason?: Reason
    }

/** 是否为终态：只要不是 running 就算结束（completed / error 都是终态）。 */
export const isTerminal = (status: Status) => status !== "running"

/**
 * 一个异步生成任务的句柄。
 * 持有 provider 专属的 Route 和一个可序列化 token，对外暴露统一的查询/等待/取消接口。
 * token 保持 opaque（unknown），Generation 从不关心它的形状——由 Route 闭包自己解码。
 */
export class Generation<Response> {
  readonly id: string
  readonly status: Status
  readonly reason?: Reason
  readonly progress?: number

  constructor(
    readonly route: Route<Response>,
    /** Route 自己持有的可序列化 JSON；可在另一个进程里传给对应模态的 resume 恢复该任务。 */
    readonly token: unknown,
    snapshot: Snapshot,
  ) {
    this.id = snapshot.id
    this.status = snapshot.status
    this.reason = snapshot.reason
    this.progress = snapshot.progress
  }

  get snapshot(): Snapshot {
    return {
      id: this.id,
      status: this.status,
      reason: this.reason,
      progress: this.progress,
    }
  }

  get terminal() {
    return isTerminal(this.status)
  }

  refresh(): Effect.Effect<Generation<Response>, AIError> {
    return this.route.status.pipe(Effect.map((snapshot) => new Generation(this.route, this.token, snapshot)))
  }

  /** 不轮询，直接取结果；未完成的终态任务会以 provider 的终态响应体报错。 */
  result(): Effect.Effect<Response, AIError> {
    return this.route.result
  }

  /**
   * 轮询直到任务进入终态，再取结果。超过 deadline 则以 Timeout 原因失败。
   *
   * 即使是“未完成的终态”（如 failed）也会走 result()，让 provider 能把具体的失败响应体暴露出来。
   */
  await(options?: AwaitOptions): Effect.Effect<Response, AIError> {
    const timeout = Duration.fromInputUnsafe(options?.poll?.timeout ?? DEFAULT_POLL_TIMEOUT)
    // 已是终态则直接返回自己，否则开始轮询
    const settled = this.terminal ? Effect.succeed(this) : this.poll(options?.poll)
    return settled.pipe(
      // 未完成的终态也走 result()，让 Route 能抛出 provider 的失败响应体
      Effect.flatMap((generation) => generation.result()),
      Effect.timeoutOrElse({ duration: timeout, orElse: () => timeoutError(this.id, timeout) }),
    )
  }

  cancel(): Effect.Effect<void, AIError> {
    return this.route.cancel ?? Effect.void
  }

  /**
   * 以流的形式持续输出状态观测，遇到第一个终态观测后结束。
   *
   * 关键设计：每次轮询和轮询之间的等待，都被“距离 poll.timeout 的剩余时间”限制，
   * 因此卡住的状态请求或过长间隔会在截止时间让流失败，而不会一直挂住。
   * 本可以用 Stream.interruptWhen 更直接地表达，但那样在 TestClock 下会死锁
   * （当源完成时定时器仍在 sleep），所以改为手动用 within + 调整后的 schedule 实现。
   */
  events(options?: AwaitOptions): Stream.Stream<Event, AIError> {
    if (this.terminal) return Stream.make(this.event())
    const timeout = Duration.fromInputUnsafe(options?.poll?.timeout ?? DEFAULT_POLL_TIMEOUT)
    return Stream.unwrap(
      Clock.currentTimeMillis.pipe(
        Effect.map((start) => {
          const deadline = start + Duration.toMillis(timeout)
          const refresh = within(this.refresh(), this.id, timeout, deadline)
          const schedule = this.schedule(options?.poll).pipe(
            Schedule.modifyDelay((meta) =>
              Effect.succeed(Duration.min(meta.duration, Duration.millis(Math.max(0, deadline - meta.now)))),
            ),
          )
          return Stream.fromEffectSchedule(refresh, schedule).pipe(
            Stream.takeUntil((generation) => generation.terminal),
            Stream.map((generation) => generation.event()),
          )
        }),
      ),
    )
  }

  /** 把当前快照转成事件：终态发 finished，否则发 progress。 */
  private event(): Event {
    if (this.terminal) return { type: "generation-finished", id: this.id, status: this.status, reason: this.reason }
    return { type: "generation-progress", id: this.id, progress: this.progress }
  }

  private poll(poll: Poll | undefined) {
    return this.refresh().pipe(
      Effect.repeat({ schedule: this.schedule(poll), until: (generation) => generation.terminal }),
    )
  }

  private schedule(poll: Poll | undefined) {
    return Schedule.spaced(poll?.interval ?? DEFAULT_POLL_INTERVAL)
  }
}

/**
 * 先发进度事件（events），再发展开后的结果。结果获取也受同一个 poll.timeout 截止时间的约束。
 * expand 把 provider 的响应展开成多条 A（例如把生成的多个图片逐个产出）。
 */
export const resultEvents = <Response, A>(
  generation: Generation<Response>,
  expand: (response: Response) => ReadonlyArray<A>,
  options?: AwaitOptions,
): Stream.Stream<Observation | A, AIError> => {
  const timeout = Duration.fromInputUnsafe(options?.poll?.timeout ?? DEFAULT_POLL_TIMEOUT)
  return Stream.unwrap(
    Clock.currentTimeMillis.pipe(
      Effect.map((start) =>
        generation.events(options).pipe(
          Stream.filter((event): event is Observation => event.type !== "generation-finished"),
          Stream.concat(
            Stream.fromIterableEffect(
              within(generation.result(), generation.id, timeout, start + Duration.toMillis(timeout)).pipe(
                Effect.map(expand),
              ),
            ),
          ),
        ),
      ),
    ),
  )
}

/**
 * Run `effect` within the time left until `deadline`. Fails before starting once the deadline has passed: a fast
 * request could otherwise win the zero-budget race and schedule another zero-delay poll.
 */
const within = <A>(effect: Effect.Effect<A, AIError>, id: string, timeout: Duration.Duration, deadline: number) =>
  Clock.currentTimeMillis.pipe(
    Effect.flatMap((now) =>
      now >= deadline
        ? Effect.fail(timeoutError(id, timeout))
        : effect.pipe(
            Effect.timeoutOrElse({
              duration: Duration.millis(deadline - now),
              orElse: () => Effect.fail(timeoutError(id, timeout)),
            }),
          ),
    ),
  )

const timeoutError = (id: string, timeout: Duration.Duration) =>
  new AIError({
    reason: new TimeoutError({
      message: `Generation ${id} did not finish within ${Duration.format(timeout)}`,
      timeoutMs: Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.ceil(Duration.toMillis(timeout)))),
    }),
  })
