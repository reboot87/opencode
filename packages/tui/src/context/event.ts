/**
 * UI 上下文 — Event。
 * UI 包的上下文提供者中负责 Event 部分，提供该部分所需的实现与类型定义。
 */
import type { OpenCodeEvent } from "@opencode/client"
import { useClient } from "./client"

type EventMetadata = {
  directory: string | undefined
}
type OpenCodeEventMap = { [Type in OpenCodeEvent["type"]]: Extract<OpenCodeEvent, { type: Type }> }

export function useEvent() {
  const client = useClient()

  function subscribe(handler: (event: OpenCodeEvent, metadata: EventMetadata) => void) {
    return client.event.listen(({ details }) => {
      if (details.type === "server.connected") return
      handler(details, { directory: details.location?.directory })
    })
  }

  function on<T extends OpenCodeEvent["type"]>(
    type: T,
    handler: (event: OpenCodeEventMap[T], metadata: EventMetadata) => void,
  ) {
    return client.event.on(type, (event) => {
      handler(event, { directory: event.location?.directory })
    })
  }

  return {
    subscribe,
    on,
  }
}
