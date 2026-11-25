/**
 * UI 上下文 — File。
 * UI 包的上下文提供者中负责 File 部分，提供该部分所需的实现与类型定义。
 */
import type { ValidComponent } from "solid-js"
import { createSimpleContext } from "./helper"

const ctx = createSimpleContext<ValidComponent, { component: ValidComponent }>({
  name: "FileComponent",
  init: (props) => props.component,
})

export const FileComponentProvider = ctx.provider

export const useFileComponent = ctx.use
