/**
 * Provider 模型 — ManageStandaloneStories。
 * provider 下模型的展示与配置中负责 ManageStandaloneStories 部分，提供该部分所需的实现与类型定义。
 */
import { Button } from "@opencode/ui/button"
import { useDialog } from "@opencode/ui/context/dialog"
import { createEffect, on, onMount } from "solid-js"
import { DialogStoryRuntime } from "@/components-lab/dialog-story-runtime"
import { DialogManageModels } from "./manage"

function ManageModelsStory(props: { query: string }) {
  const dialog = useDialog()

  // The dialog owns its filter. Send inspector edits through the same field as keyboard input.
  const open = () =>
    void dialog.show(() => {
      let host!: HTMLDivElement

      createEffect(
        on(
          () => props.query,
          (query) => {
            const field = host.querySelector<HTMLInputElement>('input[type="search"]')

            if (!field || field.value === query) return
            field.value = query
            field.dispatchEvent(new InputEvent("input", { bubbles: true }))
          },
        ),
      )

      return (
        <div class="contents" ref={host}>
          <DialogManageModels />
        </div>
      )
    })

  onMount(open)

  return (
    <Button variant="neutral" onClick={open}>
      Open manage models dialog
    </Button>
  )
}

export default {
  title: "App/Dialogs/Manage Models",
  id: "app-dialog-manage-models",
  args: { query: "" },
  render: (args: { query: string }) => (
    <DialogStoryRuntime>
      <ManageModelsStory query={args.query} />
    </DialogStoryRuntime>
  ),
}

export const Default = {}

export const ProviderSearch = { args: { query: "anthropic" } }

export const NoMatches = { args: { query: "missing-model-xyz" } }
