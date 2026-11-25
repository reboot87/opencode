/**
 * 会话仿真 — Semantics。
 * 会话流程的离线仿真模拟中负责 Semantics 部分，提供该部分所需的实现与类型定义。
 */
import type { Renderable } from "@opentui/core"
import type { SimulationProtocol } from "@opencode/simulation/protocol"

type Definition = Omit<SimulationProtocol.Frontend.SemanticNode, "id" | "element" | "parent">

const key = Symbol.for("opencode.simulation.semantics")

const bind = (definition: () => Definition) => (renderable: Renderable) => {
  Object.defineProperty(renderable, key, { value: definition, configurable: true })
}

export const SimulationSemantics = { bind }
