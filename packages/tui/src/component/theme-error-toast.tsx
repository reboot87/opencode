/**
 * 终端组件 — ThemeErrorToast。
 * 终端界面（Solid）组件中负责 ThemeErrorToast 部分，提供该部分所需的实现与类型定义。
 */
import { onCleanup } from "solid-js"
import { useThemes } from "../context/theme"
import { useToast } from "../ui/toast"

export function ThemeErrorToast() {
  const themes = useThemes()
  const toast = useToast()

  onCleanup(
    themes.onError(({ name, error }) =>
      toast.show({
        variant: "error",
        title: `Failed to load theme: ${name}`,
        message: error.message,
      }),
    ),
  )

  return null
}
