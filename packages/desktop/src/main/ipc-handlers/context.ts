/**
 * IPC 处理器 — Context。
 * 主进程与渲染进程之间的 IPC 处理中负责 Context 部分，提供该部分所需的实现与类型定义。
 */
import type { IpcPortHandoff } from "../ipc-transport"

export type RpcContext = { readonly client: { readonly id: number } }

export function sender(handoff: IpcPortHandoff["Service"], context: RpcContext) {
  const contents = handoff.sender(context.client.id)

  if (!contents || contents.isDestroyed()) throw new Error("Renderer connection not found")

  return contents
}
