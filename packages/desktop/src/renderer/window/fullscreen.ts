/**
 * 模块 — Fullscreen。
 * 该目录下的功能模块中负责 Fullscreen 部分，提供该部分所需的实现与类型定义。
 */
import { createSignal } from "solid-js"
import { api } from "../api"
import {
  createFullscreenState,
  selectWindowFullscreen,
  transitionFullscreen,
  type FullscreenEvent,
} from "./fullscreen-machine"

let state = createFullscreenState()

const [windowFullscreen, setWindowFullscreen] = createSignal(selectWindowFullscreen(state))

const dispatch = (event: FullscreenEvent) => {
  const next = transitionFullscreen(state, event)

  if (next === state) return
  state = next
  setWindowFullscreen(selectWindowFullscreen(state))
}

api.onWindowFullscreenChanged((fullscreen) => dispatch({ type: "fullscreen.changed", fullscreen }))

void api.getWindowFullscreen().then(
  (fullscreen) => dispatch({ type: "fullscreen.seeded", fullscreen }),
  () => dispatch({ type: "fullscreen.seed-failed" }),
)

export { windowFullscreen }
