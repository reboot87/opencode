/**
 * UI 上下文 — Args。
 * UI 包的上下文提供者中负责 Args 部分，提供该部分所需的实现与类型定义。
 */
import { mergeProps } from "solid-js"
import { createSimpleContext } from "./helper"

export interface Args {
  model?: string
  agent?: string
  prompt?: string
  continue?: boolean
  sessionID?: string
  newSessionID?: string
  fork?: boolean
  auto?: boolean
}

export const { use: useArgs, provider: ArgsProvider } = createSimpleContext({
  name: "Args",
  init: (props: Args) => {
    // The first new session created from home takes this ID; later ones mint their own.
    let pending = props.newSessionID
    return mergeProps(props, {
      takeNewSessionID() {
        const id = pending
        pending = undefined
        return id
      },
      restoreNewSessionID(id: string) {
        pending ??= id
      },
    })
  },
})
