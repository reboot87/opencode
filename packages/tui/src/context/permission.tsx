/**
 * UI 上下文 — Permission。
 * UI 包的上下文提供者中负责 Permission 部分，提供该部分所需的实现与类型定义。
 */
import { useConfig } from "../config"
import { useArgs } from "./args"
import { createSimpleContext } from "./helper"

export type PermissionMode = "prompt" | "autoaccept"

export const { use: usePermission, provider: PermissionProvider } = createSimpleContext({
  name: "Permission",
  init: () => {
    const args = useArgs()
    const config = useConfig()
    return {
      get mode(): PermissionMode {
        return args.auto ? "autoaccept" : config.data.session.permissions
      },
    }
  },
})
