/**
 * 运行时服务端连接 — Current。
 * 浏览器端与服务端的连接与同步中负责 Current 部分，提供该部分所需的实现与类型定义。
 */
import { Show, type JSX, type ParentProps } from "solid-js"
import { createSimpleContext } from "@opencode/ui/context"
import { ServerConnection } from "./registry"
import { useGlobal, type ServerCtx } from "./runtime"

const context = createSimpleContext({
  name: "Server",
  init: (props: { conn: ServerConnection.Any; ctx: ServerCtx }) => {
    const conn = props.conn
    const key = ServerConnection.key(conn)

    const global = useGlobal()

    return {
      conn,
      key,
      get isLocal() {
        return props.ctx.isLocal
      },
      ctx: props.ctx,
      get health() {
        return global.servers.health[key]
      },
    }
  },
})

export const useServer = context.use

// Keyed by controller: while the server rejects our credentials the children unmount and `signedOut` shows instead,
// and they mount again with the controller its new credentials start.
export function ServerProvider(props: ParentProps<{ conn: ServerConnection.Any; signedOut?: JSX.Element }>) {
  const global = useGlobal()
  const key = ServerConnection.key(props.conn)

  return (
    <Show
      when={global.serverCtx(key)}
      keyed
      fallback={<Show when={global.serverSignedOut(key)}>{props.signedOut}</Show>}
    >
      {(ctx) => (
        <context.provider conn={props.conn} ctx={ctx}>
          {props.children}
        </context.provider>
      )}
    </Show>
  )
}

export const useData = () => {
  const server = useServer()

  return server.ctx.data
}
