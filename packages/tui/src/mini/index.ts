/**
 * Mini 精简界面 — Index 出口。
 * 集中导出 Mini 精简界面 中 Index 相关的实现、组件与类型。
 */
import { runInteractiveDeferredMode, type RunDeferredInput } from "./runtime"

export type MiniFrontendInput = RunDeferredInput

export async function runMiniFrontend(input: MiniFrontendInput): Promise<void> {
  await runInteractiveDeferredMode(input)
}
