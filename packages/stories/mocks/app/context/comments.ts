/**
 * 模块 — Comments。
 * 该目录下的功能模块中负责 Comments 部分，提供该部分所需的实现与类型定义。
 */
import { createSignal } from "solid-js"

type Comment = {
  id: string
  file: string
  selection: { start: number; end: number }
  comment: string
  time: number
}

const [list, setList] = createSignal<Comment[]>([])
const [focus, setFocus] = createSignal<{ file: string; id: string } | null>(null)
const [active, setActive] = createSignal<{ file: string; id: string } | null>(null)

export function useComments() {
  return {
    all: list,
    replace(next: Comment[]) {
      setList(next)
    },
    remove(file: string, id: string) {
      setList((current) => current.filter((item) => !(item.file === file && item.id === id)))
    },
    clear() {
      setList([])
      setFocus(null)
      setActive(null)
    },
    open(target: { file: string; id: string }) {
      setActive(target)
      setFocus(target)
    },
    focus,
    setFocus,
    active,
    setActive,
  }
}
