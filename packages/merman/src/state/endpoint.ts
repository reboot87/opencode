/**
 * 模块 — Endpoint。
 * 该目录下的功能模块中负责 Endpoint 部分，提供该部分所需的实现与类型定义。
 */
export function stateDiagramStartMarkerId(scope?: string): string {
  return scope ? `${scope}.__start` : "__start"
}

export function stateDiagramEndMarkerId(scope?: string): string {
  return scope ? `${scope}.__end` : "__end"
}

export function stateDiagramMarkerId(position: "from" | "to", scope?: string): string {
  return position === "from" ? stateDiagramStartMarkerId(scope) : stateDiagramEndMarkerId(scope)
}

export function normalizeStateDiagramEndpoint(value: string, position: "from" | "to", scope?: string): string {
  return value === "[*]" ? stateDiagramMarkerId(position, scope) : value
}
