/**
 * Provider 连接 — ChatgptWelcomeStories。
 * 连接 provider 的授权界面中负责 ChatgptWelcomeStories 部分，提供该部分所需的实现与类型定义。
 */
import { Button } from "@opencode/ui/button"
import { useDialog } from "@opencode/ui/context/dialog"
import { onMount } from "solid-js"
import { DialogChatGPTPlanWelcome } from "./chatgpt-welcome"

function WelcomeStory() {
  const dialog = useDialog()
  const open = () => dialog.show(() => <DialogChatGPTPlanWelcome />)
  onMount(open)

  return (
    <Button variant="neutral" onClick={open}>
      Open ChatGPT plan welcome
    </Button>
  )
}

export default {
  title: "App/Dialogs/ChatGPT welcome",
  id: "app-dialog-chatgpt-welcome",
}

export const ChatGPTPlanWelcome = { render: () => <WelcomeStory /> }
