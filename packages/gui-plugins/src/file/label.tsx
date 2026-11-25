/**
 * 文件插件 — Label。
 * 文件预览与操作的 GUI 插件中负责 Label 部分，提供该部分所需的实现与类型定义。
 */
import type { JSX } from "solid-js"
import { FileIcon } from "@opencode/ui/file-icon"
import { getFilename } from "@opencode/util/path"

/** A file tab's trigger content. The selected tab's icon colour comes from the tab CSS. */
export function FileVisual(props: { path: string; temporary?: boolean; notFound?: boolean }): JSX.Element {
  return (
    <div class="flex items-center gap-x-2 min-w-0">
      <span class="relative inline-flex size-4 shrink-0">
        <FileIcon node={{ path: props.path, type: "file" }} class="absolute inset-0 size-4 tab-fileicon-color" />
        <FileIcon node={{ path: props.path, type: "file" }} mono class="absolute inset-0 size-4 tab-fileicon-mono" />
      </span>
      <span
        class="font-sans font-medium leading-[calc(var(--font-size-base)*1.5)] tracking-normal truncate"
        classList={{ italic: props.temporary, "line-through": props.notFound }}
        data-file-not-found={props.notFound ? "" : undefined}
      >
        {getFilename(props.path)}
      </span>
    </div>
  )
}
