/**
 * 终端界面 — AttentionSoundsBun。
 * OpenCode 终端界面的整体骨架与入口中负责 AttentionSoundsBun 部分，提供该部分所需的实现与类型定义。
 */
/// <reference path="./audio.d.ts" />
import defaultSoundPath from "@opencode/ui/audio/bip-bop-01.mp3" with { type: "file" }
import questionSoundPath from "@opencode/ui/audio/bip-bop-03.mp3" with { type: "file" }
import permissionSoundPath from "@opencode/ui/audio/staplebops-06.mp3" with { type: "file" }
import errorSoundPath from "@opencode/ui/audio/nope-03.mp3" with { type: "file" }
import subagentDoneSoundPath from "@opencode/ui/audio/yup-01.mp3" with { type: "file" }

export { defaultSoundPath, questionSoundPath, permissionSoundPath, errorSoundPath, subagentDoneSoundPath }
