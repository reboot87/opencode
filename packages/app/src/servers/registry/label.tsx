/**
 * 服务端注册表 — Label。
 * 已知服务端的登记与状态中负责 Label 部分，提供该部分所需的实现与类型定义。
 */
import { Show } from "solid-js"
import { type ServerConnection, useServers } from "@/runtime/server/registry"

/** A server's name; menu rows that choose a server pass `hint` to add a muted "This computer" beside the current one. */
export function ServerLabel(props: { server?: ServerConnection.Any; name?: string; hint?: boolean; class?: string }) {
  const servers = useServers()

  return (
    <span data-component="server-label" class={`flex min-w-0 items-center gap-1 ${props.class ?? ""}`}>
      <bdi dir="auto" class="min-w-0 truncate">
        {props.name ?? (props.server ? servers.label(props.server) : "")}
      </bdi>
      <Show when={props.hint && props.server && servers.hint(props.server)}>
        {(hint) => (
          <span data-slot="server-label-hint" class="shrink-0 whitespace-nowrap text-v2-text-text-muted">
            <span aria-hidden="true">· </span>
            {hint()}
          </span>
        )}
      </Show>
    </span>
  )
}
