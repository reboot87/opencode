/**
 * 变更统计 — DiffChanges。
 * 展示代码变更行数统计的组件中负责 DiffChanges 部分，提供该部分所需的实现与类型定义。
 */
import { createMemo, Show } from "solid-js"
import "./diff-changes.css"

export function DiffChanges(props: {
  class?: string
  appearance?: "standard" | "compact"
  /** Marks a side with no changes `data-empty`, so a page can hide it. */
  markEmpty?: boolean
  changes: { additions: number; deletions: number } | { additions: number; deletions: number }[]
}) {
  const additions = createMemo(() =>
    Array.isArray(props.changes)
      ? props.changes.reduce((acc, diff) => acc + (diff.additions ?? 0), 0)
      : props.changes.additions,
  )

  const deletions = createMemo(() =>
    Array.isArray(props.changes)
      ? props.changes.reduce((acc, diff) => acc + (diff.deletions ?? 0), 0)
      : props.changes.deletions,
  )

  const total = createMemo(() => (additions() ?? 0) + (deletions() ?? 0))

  return (
    <Show when={total() > 0}>
      <div
        data-component="diff-changes"
        data-appearance={props.appearance ?? "compact"}
        classList={{ [props.class ?? ""]: true }}
      >
        <span
          data-slot="diff-changes-additions"
          data-empty={props.markEmpty && !additions() ? "" : undefined}
        >{`+${additions()}`}</span>
        <span
          data-slot="diff-changes-deletions"
          data-empty={props.markEmpty && !deletions() ? "" : undefined}
        >{`-${deletions()}`}</span>
      </div>
    </Show>
  )
}
