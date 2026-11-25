/**
 * 服务端注册表 — RowItems。
 * 已知服务端的登记与状态中负责 RowItems 部分，提供该部分所需的实现与类型定义。
 */
import { Menu } from "@opencode/ui/menu"
import { For } from "solid-js"
import { useServerRowItems } from "@/runtime/plugin/servers"

/** Plugin "server.row" menu items for one server, placed inside that row's menu. */
export function ServerRowItems(props: { server: string }) {
  const items = useServerRowItems(() => props.server)

  return (
    <For each={items()}>
      {(item) => (
        <Menu.Item disabled={item.enabled?.(props.server) === false} onSelect={() => item.run(props.server)}>
          {item.title}
        </Menu.Item>
      )}
    </For>
  )
}
