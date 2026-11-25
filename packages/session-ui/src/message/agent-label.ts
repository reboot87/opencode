/**
 * 消息渲染 — AgentLabel。
 * 会话消息的渲染组件中负责 AgentLabel 部分，提供该部分所需的实现与类型定义。
 */
export function agentLabel(agent: string | undefined, visible: boolean) {
  return visible && agent ? agent[0]?.toUpperCase() + agent.slice(1) : ""
}
