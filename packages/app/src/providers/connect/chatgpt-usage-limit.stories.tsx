/**
 * Provider 连接 — ChatgptUsageLimitStories。
 * 连接 provider 的授权界面中负责 ChatgptUsageLimitStories 部分，提供该部分所需的实现与类型定义。
 */
import { Button } from "@opencode/ui/button"
import { useDialog } from "@opencode/ui/context/dialog"
import { onMount } from "solid-js"
import { DialogChatGPTUsageLimit } from "./chatgpt-usage-limit"

function UsageLimitStory(props: { workspace?: boolean }) {
  const dialog = useDialog()
  const open = () => dialog.show(() => <DialogChatGPTUsageLimit workspace={props.workspace} />)
  onMount(open)

  return (
    <Button variant="neutral" onClick={open}>
      Open ChatGPT usage limit
    </Button>
  )
}

export default {
  title: "App/Dialogs/ChatGPT usage limit",
  id: "app-dialog-chatgpt-usage-limit",
}

export const ChatGPTUsageLimit = { render: () => <UsageLimitStory /> }

export const ChatGPTWorkspaceUsageLimit = { render: () => <UsageLimitStory workspace /> }
