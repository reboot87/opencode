/**
 * 通用组件 — Progress。
 * 跨场景复用的通用 UI 组件中负责 Progress 部分，提供该部分所需的实现与类型定义。
 */
import { Progress as Kobalte } from "@kobalte/core/progress"
import { Show, splitProps } from "solid-js"
import type { ComponentProps, ParentProps } from "solid-js"

export interface ProgressProps extends ParentProps<ComponentProps<typeof Kobalte>> {
  hideLabel?: boolean
  showValueLabel?: boolean
}

export function Progress(props: ProgressProps) {
  const [local, others] = splitProps(props, ["children", "class", "classList", "hideLabel", "showValueLabel"])

  return (
    <Kobalte
      {...others}
      data-component="progress"
      classList={{
        ...local.classList,
        [local.class ?? ""]: !!local.class,
      }}
    >
      <Show when={local.children || local.showValueLabel}>
        <div data-slot="progress-header">
          <Show when={local.children}>
            <Kobalte.Label data-slot="progress-label" classList={{ "sr-only": local.hideLabel }}>
              {local.children}
            </Kobalte.Label>
          </Show>
          <Show when={local.showValueLabel}>
            <Kobalte.ValueLabel data-slot="progress-value-label" />
          </Show>
        </div>
      </Show>
      <Kobalte.Track data-slot="progress-track">
        <Kobalte.Fill data-slot="progress-fill" />
      </Kobalte.Track>
    </Kobalte>
  )
}
