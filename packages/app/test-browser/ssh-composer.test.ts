/**
 * 浏览器测试 — SshComposerTest。
 * 浏览器环境下的测试中负责 SshComposerTest 部分，提供该部分所需的实现与类型定义。
 */
import { expect, test } from "bun:test"
import { createRoot } from "solid-js"
import { createStore } from "solid-js/store"
import { createComposerEditor } from "../src/composer/editor/interaction"
import type { ComposerPersistedState } from "../src/composer/types"

test("a disconnected composer preserves text and ignores submissions until reconnect", () => {
  createRoot((dispose) => {
    const [state, setState] = createStore({ connected: false, submissions: 0 })

    const store = createStore<ComposerPersistedState>({
      prompt: [{ type: "text", content: "keep my draft", start: 0, end: 13 }],
      context: { items: [] },
    })

    const editor = createComposerEditor({
      store,
      commands: () => [],
      context: () => [],
      searchContextFiles: () => [],
      view: {
        submit: {
          available: () => state.connected,
          stopping: () => false,
          onStop() {},
          onSubmit: () => setState("submissions", (count) => count + 1),
        },
      },
    })

    expect(editor.canSubmit()).toBe(false)
    editor.submit()
    expect(state.submissions).toBe(0)
    expect(editor.value()).toBe("keep my draft")
    setState("connected", true)
    expect(editor.canSubmit()).toBe(true)
    editor.submit()
    expect(state.submissions).toBe(1)
    dispose()
  })
})
