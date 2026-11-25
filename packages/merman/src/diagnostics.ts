/**
 * GUI 插件 — Diagnostics。
 * GUI 插件的实现中负责 Diagnostics 部分，提供该部分所需的实现与类型定义。
 */
export type MermaidDiagramKind = "flowchart" | "sequence" | "state" | "timeline" | "gitGraph" | "gantt"

/** An otherwise valid diagram contains syntax that this renderer does not support. */
export class MermaidSyntaxError extends Error {
  readonly _tag = "MermaidSyntaxError"

  constructor(
    readonly kind: MermaidDiagramKind,
    readonly lineNumber: number,
    readonly sourceLine: string,
    reason = "Unsupported syntax",
  ) {
    super(`${reason} in ${kind} diagram at line ${lineNumber}: "${sourceLine}"`)
    this.name = "MermaidSyntaxError"
  }
}
