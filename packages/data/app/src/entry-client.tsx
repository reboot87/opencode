/**
 * 数据站源码 — EntryClient。
 * 模型能力对比站点的实现中负责 EntryClient 部分，提供该部分所需的实现与类型定义。
 */
// @refresh reload
import { mount, StartClient } from "@solidjs/start/client"

const root = document.getElementById("app")
if (!root) throw new Error("Root element #app not found")

mount(() => <StartClient />, root)
