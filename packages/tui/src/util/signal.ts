/**
 * 终端工具 — Signal。
 * 终端界面的通用工具函数中负责 Signal 部分，提供该部分所需的实现与类型定义。
 */
import { createEffect, createSignal, on, onCleanup, type Accessor } from "solid-js"
import { createAnimatable, tween } from "../ui/animation"

export function createDebouncedSignal<T>(value: T, ms: number): [Accessor<T>, (value: T) => void] {
  const [get, set] = createSignal(value)
  let timer: ReturnType<typeof setTimeout> | undefined
  const debounced = (next: T) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = undefined
      set(() => next)
    }, ms)
  }
  onCleanup(() => {
    if (timer) clearTimeout(timer)
  })
  return [get, debounced]
}

export function createFadeIn(show: Accessor<boolean>, enabled: Accessor<boolean>) {
  const alpha = createAnimatable(
    { value: show() ? 1 : 0 },
    {
      enabled,
      transition: tween({ duration: 0.16 }),
    },
  )
  let revealed = show()

  createEffect(
    on([show, enabled], ([visible, animate]) => {
      if (!visible) {
        alpha.jump({ value: 0 })
        return
      }

      if (!animate || revealed) {
        revealed = true
        alpha.jump({ value: 1 })
        return
      }

      revealed = true
      alpha.animate({ value: 1 })
    }),
  )

  return () => alpha.value().value
}
