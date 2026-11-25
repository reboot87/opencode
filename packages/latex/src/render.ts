/**
 * GUI 插件 — Render。
 * GUI 插件的实现中负责 Render 部分，提供该部分所需的实现与类型定义。
 */
import { layoutMath } from "./layout"
import { parseLatex } from "./parser"
import type { MathLayout, RenderLatexOptions } from "./types"

export function renderLatex(source: string, options: RenderLatexOptions = {}): MathLayout {
  return layoutMath(parseLatex(source, options), options)
}

export function renderLatexToString(source: string, options: RenderLatexOptions = {}): string {
  return renderLatex(source, options).toString()
}
