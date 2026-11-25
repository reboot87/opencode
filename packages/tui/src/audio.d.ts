/**
 * 终端界面 — AudioD。
 * OpenCode 终端界面的整体骨架与入口中负责 AudioD 部分，提供该部分所需的实现与类型定义。
 */
declare module "*.mp3" {
  const path: string
  export default path
}

declare module "@opencode/ui/audio/*.mp3" {
  const path: string
  export default path
}
