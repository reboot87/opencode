/**
 * IPC 处理器 — Events。
 * 主进程与渲染进程之间的 IPC 处理中负责 Events 部分，提供该部分所需的实现与类型定义。
 */
import { Effect, Stream } from "effect"
import { EventRpcs } from "../../shared/ipc-rpc"
import { IpcPortHandoff } from "../ipc-transport"

export const eventHandlers = EventRpcs.toLayer(
  Effect.gen(function* () {
    const handoff = yield* IpcPortHandoff

    return EventRpcs.of({
      DesktopEvents: (_request, context) => {
        const events = handoff.events(context.client.id)

        return events ? Stream.fromQueue(events) : Stream.empty
      },
    })
  }),
)
