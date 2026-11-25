/**
 * 提示词缓存策略：通过把 CacheHint（缓存标记）注入到请求中指定的部分，来应用 LLMRequest.cache 策略。
 *
 * 执行时机：在编译请求时运行一次，位于各协议的 body 构建器之前，
 * 这样后续复用已有的“内联标记降级”路径处理即可。
 *
 * 默认 "auto" 策略在四处放置缓存断点：最后一个工具定义、第一个和最后一个不同的系统部分、对话末尾。
 * 这样能暴露可复用的前缀：工具前缀、基础 agent 前缀、项目前缀、会话前缀；
 * 而每次工具结果之后推进尾部断点，能让长 agent 运行中的最近对话前缀持续复用。
 *
 * 手动在各 part 上放置的 cache: CacheHint 会被保留，并计入四个断点的预算；
 * 自动策略只填充剩余的空闲位置。
 */
import { CacheHint, type CachePolicy, type CachePolicyObject, type CacheTTL } from "./schema/options.js"
import {
  AssistantMessage,
  type LLMRequest,
  type Message,
  SystemMessage,
  ToolDefinition,
  ToolMessage,
  UserMessage,
  type ContentPart,
  type ToolEntry,
} from "./schema/messages.js"
import { effortUpdate } from "./effort-updates.js"
import { toolsUpdate } from "./tool-updates.js"

const AUTO: CachePolicyObject = {
  tools: true,
  system: true,
  messages: { tail: 1 },
}

const NONE: CachePolicyObject = {}
// 断点总数上限：大多数提供方（如 Anthropic）最多支持 4 个缓存断点
const BREAKPOINT_CAP = 4

// 策略解析规则：
//   - undefined → "auto"，即默认开启缓存；
//   - "auto"    → 工具 + 首个/末个系统部分 + 最后一条消息边界；
//   - "none"    → 不做自动放置，但手动的 CacheHint 仍然生效；
//   - { ttl }   → 使用指定生存时间的 "auto"；
//   - 对象形式  → 完全按调用方要求。
const resolve = (policy: CachePolicy | undefined): CachePolicyObject => {
  if (policy === "none") return NONE
  if (typeof policy === "object" && !isAuto(policy)) return policy
  return AUTO
}

const isAuto = (policy: CachePolicy | undefined) =>
  policy === undefined ||
  policy === "auto" ||
  (typeof policy === "object" &&
    policy.tools === undefined &&
    policy.system === undefined &&
    policy.messages === undefined)

/** 取出请求的缓存生存时间（TTL）：给那些在请求级选项而非标记上发送 TTL 的协议使用。 */
export const requestTTL = (request: LLMRequest) => (typeof request.cache === "object" ? request.cache.ttl : undefined)

// 这些协议的 wire 格式会忽略内联缓存标记（OpenAI 的隐式前缀缓存、Gemini 的隐式 + 带外 CachedContent）。
// 对它们跳过整个策略处理——发出标记无害但没有意义。
const RESPECTS_INLINE_HINTS = new Set([
  "alibaba-chat",
  "alibaba-messages",
  "anthropic-messages",
  "anthropic-compatible-messages",
  "bedrock-mantle-messages",
  "cloudflare-ai-gateway-messages",
  "google-vertex-messages",
  "meta-messages",
  "minimax-messages",
  "moonshot-messages",
  "vercel-ai-gateway-messages",
  "zai-coding-messages",
  "bedrock-converse",
  "openrouter",
  "digitalocean",
])

// OpenRouter and Vercel AI Gateway upstreams other than Anthropic and Alibaba Qwen cache without breakpoints.
// Gemini uses only the last breakpoint, so a conversation-tail breakpoint writes a new cache every step and costs
// more than none. Qwen ignores breakpoints on tool definitions and caches tools with the system prompt.
const QWEN: CachePolicyObject = { system: true, messages: { tail: 1 } }
const gatewayPolicy = (modelID: string): CachePolicyObject => {
  // `~anthropic/claude-sonnet-latest` style IDs are OpenRouter aliases for the latest model in a family.
  const id = modelID.replace(/^~/, "")
  if (id.startsWith("anthropic/")) return AUTO
  if (id.startsWith("qwen/") || id.startsWith("alibaba/qwen")) return QWEN
  return NONE
}

/** 根据 TTL 构造一个 ephemeral（临时）缓存标记。 */
const makeHint = (ttl: CacheTTL | undefined): CacheHint =>
  ttl !== undefined ? new CacheHint({ type: "ephemeral", ttl }) : new CacheHint({ type: "ephemeral" })

/** 断点预算：记录还剩几个缓存标记可以放置。 */
interface Budget {
  remaining: number
}

/** 在最后一个工具定义上打缓存标记；遇到命名空间会递归到最后一项。已标记或预算耗尽则跳过。 */
const markLastTool = (tools: ReadonlyArray<ToolEntry>, hint: CacheHint, budget: Budget): ReadonlyArray<ToolEntry> => {
  const target = tools.at(-1)
  if (target === undefined) return tools
  if (target.type === "namespace") {
    const nested = markLastTool(target.tools, hint, budget)
    return nested === target.tools ? tools : [...tools.slice(0, -1), { ...target, tools: nested }]
  }
  if (target.cache || budget.remaining === 0) return tools
  budget.remaining -= 1
  return [...tools.slice(0, -1), new ToolDefinition({ ...target, cache: hint })]
}

/** 统计工具树里已存在的缓存标记数量（含命名空间内的递归统计）。 */
const countToolHints = (tools: ReadonlyArray<ToolEntry>): number =>
  tools.reduce(
    (count, tool) => count + (tool.type === "tool" ? (tool.cache === undefined ? 0 : 1) : countToolHints(tool.tools)),
    0,
  )

/** 在系统部分的首尾两处打缓存标记（暴露基础 agent / 项目前缀），受预算限制。 */
const markSystemBoundaries = (system: LLMRequest["system"], hint: CacheHint, budget: Budget): LLMRequest["system"] => {
  if (system.length === 0) return system
  let changed = false
  const next = system.map((part, index) => {
    if ((index !== 0 && index !== system.length - 1) || part.cache || budget.remaining === 0) return part
    budget.remaining -= 1
    changed = true
    return { ...part, cache: hint }
  })
  return changed ? next : system
}

const lastIndexOfRole = (messages: ReadonlyArray<Message>, role: Message["role"]): number =>
  messages.findLastIndex((m) => m.role === role)

type CacheablePart = Exclude<ContentPart, { readonly type: "compaction" | "effort" }>

const isCacheablePart = (part: ContentPart): part is CacheablePart =>
  part.type !== "compaction" && part.type !== "effort"

// Mark the last text part of `messages[index]`. If no text part exists, mark
// the last cacheable content part — that's the breakpoint position
// in tool-result-only messages too.
const markMessageAt = (
  messages: ReadonlyArray<Message>,
  index: number,
  hint: CacheHint,
  budget: Budget,
): ReadonlyArray<Message> => {
  if (index < 0 || index >= messages.length) return messages
  const target = messages[index]!
  if (target.content.length === 0) return messages
  const lastTextIndex = target.content.findLastIndex((part) => part.type === "text")
  const markAt = lastTextIndex >= 0 ? lastTextIndex : target.content.findLastIndex(isCacheablePart)
  const existing = target.content[markAt]
  if (!existing || !isCacheablePart(existing) || existing.cache || budget.remaining === 0) return messages
  budget.remaining -= 1
  const next = cachePartAt(target, markAt, hint)
  // Single pass over `messages`, substituting the one updated entry. Long
  // conversations call this on every request, so avoid `.map()` here — its
  // closure dispatch and identity copies show up in profiling.
  const result = messages.slice()
  result[index] = next
  return result
}

const cachePartAt = (message: Message, index: number, hint: CacheHint): Message => {
  switch (message.role) {
    case "system":
      return new SystemMessage({ ...message, content: cacheContentAt(message.content, index, hint) })
    case "user":
      return new UserMessage({ ...message, content: cacheContentAt(message.content, index, hint) })
    case "assistant":
      return new AssistantMessage({ ...message, content: cacheContentAt(message.content, index, hint) })
    case "tool":
      return new ToolMessage({ ...message, content: cacheContentAt(message.content, index, hint) })
  }
}

const cacheContentAt = <Part extends ContentPart>(content: ReadonlyArray<Part>, index: number, hint: CacheHint) =>
  content.map((part, i) => (i === index ? { ...part, cache: hint } : part))

const markMessages = (
  messages: ReadonlyArray<Message>,
  strategy: NonNullable<CachePolicyObject["messages"]>,
  hint: CacheHint,
  budget: Budget,
): ReadonlyArray<Message> => {
  if (messages.length === 0) return messages
  if (strategy === "latest-user-message")
    return markMessageAt(messages, lastIndexOfRole(messages, "user"), hint, budget)
  if (strategy === "latest-assistant")
    return markMessageAt(messages, lastIndexOfRole(messages, "assistant"), hint, budget)
  let start = messages.length
  let remaining = strategy.tail
  while (remaining > 0 && start > 0) {
    start -= 1
    if (!isMarker(messages[start]!)) remaining -= 1
  }
  let next = messages
  for (let i = start; i < messages.length; i++) if (!isMarker(messages[i]!)) next = markMessageAt(next, i, hint, budget)
  return next
}

const isMarker = (message: Message) => effortUpdate(message) !== undefined || toolsUpdate(message) !== undefined

const countHints = (request: LLMRequest) =>
  countToolHints(request.tools) +
  request.system.reduce((count, part) => count + (part.cache === undefined ? 0 : 1), 0) +
  request.messages.reduce(
    (count, message) =>
      count +
      message.content.reduce(
        (contentCount, part) => contentCount + (isCacheablePart(part) && part.cache !== undefined ? 1 : 0),
        0,
      ),
    0,
  )

/**
 * 应用缓存策略的入口：选中策略后，依次给工具、系统部分、消息打标记。
 *
 * 预算 = 断点上限 - 已有标记数，保证总断点不超过提供方限制（4 个）。
 * 若三部分都没变化，直接返回原请求（避免不必要的对象分配）。
 */
export const applyCachePolicy = (request: LLMRequest): LLMRequest => {
  const policy = selectPolicy(request)
  if (!policy.tools && !policy.system && !policy.messages) return request

  const hint = makeHint(requestTTL(request))
  // 剩余预算：扣掉请求里已经存在的手动标记
  const budget = { remaining: Math.max(0, BREAKPOINT_CAP - countHints(request)) }
  const tools = policy.tools ? markLastTool(request.tools, hint, budget) : request.tools
  const system = policy.system ? markSystemBoundaries(request.system, hint, budget) : request.system
  const messages = policy.messages ? markMessages(request.messages, policy.messages, hint, budget) : request.messages

  // 三者都未改变则原样返回
  if (tools === request.tools && system === request.system && messages === request.messages) return request
  return { ...request, tools, system, messages }
}

/** 判断策略是否会放置内联标记——这些标记会承载请求的 TTL。 */
export const placesMarkers = (request: LLMRequest) => {
  const policy = selectPolicy(request)
  return Boolean(policy.tools || policy.system || policy.messages)
}

// 选择实际生效的缓存策略。声明的 cacheFormat 优先级最高，覆盖路由白名单和模型 ID 启发式判断。
const selectPolicy = (request: LLMRequest): CachePolicyObject => {
  const format = request.model.compatibility?.cacheFormat
  const route = request.model.route.id
  const auto = isAuto(request.cache)
  if (format === "alibaba") return auto ? QWEN : { ...resolve(request.cache), tools: false }
  if (format === "anthropic") return resolve(request.cache)
  if (!RESPECTS_INLINE_HINTS.has(route)) return NONE
  if (!auto) return resolve(request.cache)
  if (route === "openrouter" || route === "vercel-ai-gateway-messages") return gatewayPolicy(request.model.id)
  if (route === "alibaba-chat") return request.model.id.toLowerCase().startsWith("qwen") ? QWEN : NONE
  return AUTO
}
