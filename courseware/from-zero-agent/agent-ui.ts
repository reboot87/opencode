/**
 * 同一个 agent，换成「异步 + 浏览器界面」（约 260 行 agent + 85 行 ui.html）
 *
 * 页面只写一份 ui.html：cpp/ 那个 C++ 版也读同一份页面。
 *
 * 和 agent.ts 的差别只有三处：
 *   1. 不跑完再打印：每一步发生的事都推给页面（SSE）
 *   2. 权限不用敲 y/N：页面上的按钮，等的时候页面照样能点
 *   3. 随时能停：fetch 和子进程一起被 AbortSignal 打断
 *
 *   bun run agent-ui.ts
 *   打开 http://localhost:3000
 *
 * 兼容任何 OpenAI 格式的接口:
 *   OPENAI_BASE_URL=https://api.deepseek.com/v1
 *   MODEL=deepseek-chat
 */

const BASE_URL = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1"
const API_KEY = process.env.OPENAI_API_KEY ?? ""
const MODEL = process.env.MODEL ?? "gpt-4.1-mini"
const PORT = Number(process.env.PORT ?? 3000)
const MAX_STEPS = 20
const MAX_OUTPUT = 8000

// ---------------------------------------------------------------- 1. 工具

type Tool = {
  name: string
  description: string
  parameters: Record<string, unknown>
  run: (args: Record<string, string>, signal: AbortSignal) => Promise<string>
}

const truncate = (text: string) =>
  text.length > MAX_OUTPUT ? text.slice(0, MAX_OUTPUT) + `\n…（已截断 ${text.length - MAX_OUTPUT} 字）` : text

const tools: Tool[] = [
  {
    name: "read_file",
    description: "读取文件内容。路径相对于当前工作目录。",
    parameters: {
      type: "object",
      properties: { path: { type: "string" } },
      required: ["path"],
    },
    run: async (args) => truncate(await Bun.file(args.path).text()),
  },
  {
    name: "write_file",
    description: "创建或覆盖一个文件。",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string" },
        content: { type: "string" },
      },
      required: ["path", "content"],
    },
    run: async (args) => {
      await Bun.write(args.path, args.content)
      return `已写入 ${args.path}（${args.content.length} 字）`
    },
  },
  {
    name: "run_shell",
    description: "执行一条命令并返回输出。用于查看目录、跑测试、git 查询。",
    parameters: {
      type: "object",
      properties: {
        command: { type: "string" },
      },
      required: ["command"],
    },
    run: (args, signal) => sh(args.command, signal),
  },
]

// 和 agent.ts 的区别：spawn 而不是 spawnSync。命令还在跑，这个线程就能继续响应页面请求。
async function sh(command: string, signal: AbortSignal) {
  const cmd =
    process.platform === "win32"
      ? ["powershell", "-NoProfile", "-Command", `[Console]::OutputEncoding=[Text.Encoding]::UTF8; ${command}`]
      : ["bash", "-lc", command]
  signal.throwIfAborted()
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" })
  const kill = () => proc.kill()
  signal.addEventListener("abort", kill, { once: true })
  try {
    const [out, err] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()])
    await proc.exited
    signal.throwIfAborted() // 被停掉时不要把半截输出当成成功结果回灌给模型
    return truncate((out + err).trim() || `(exit ${proc.exitCode}，无输出)`)
  } finally {
    signal.removeEventListener("abort", kill)
  }
}

// ---------------------------------------------------------------- 2. 权限

type Effect = "allow" | "ask" | "deny"
type Rule = { tool: string; pattern: string; effect: Effect }

// 从上到下是「宽泛 → 具体」，最后一条命中的规则生效。
const rules: Rule[] = [
  { tool: "read_file", pattern: "*", effect: "allow" },
  { tool: "write_file", pattern: "*", effect: "ask" },
  { tool: "run_shell", pattern: "*", effect: "ask" },
  { tool: "run_shell", pattern: "git status*", effect: "allow" },
  { tool: "run_shell", pattern: "git diff*", effect: "allow" },
  { tool: "run_shell", pattern: "rm -rf*", effect: "deny" },
]

function matches(pattern: string, value: string) {
  if (pattern === "*") return true
  if (pattern.endsWith("*")) return value.startsWith(pattern.slice(0, -1))
  return value === pattern
}

function decide(tool: string, target: string): Effect {
  const hit = rules.findLast((r) => r.tool === tool && matches(r.pattern, target))
  return hit?.effect ?? "ask" // 没命中任何规则时，默认询问
}

// 不再读 stdin：把问题推给页面，等一个 HTTP 答复。等待期间线程是空闲的。
let pendingAsk: ((ok: boolean) => void) | null = null

const ask = (name: string, target: string) =>
  new Promise<boolean>((resolve) => {
    pendingAsk = resolve
    send({ type: "ask", name, target })
  })

// ---------------------------------------------------------------- 3. 事件通道

const clients = new Set<ReadableStreamDefaultController<Uint8Array>>()
const encoder = new TextEncoder()

function broadcast(frame: Uint8Array) {
  for (const client of clients) {
    try {
      client.enqueue(frame)
    } catch {
      clients.delete(client) // 页面关掉或刷新了
    }
  }
}

function send(event: Record<string, unknown>) {
  broadcast(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
}

// 空闲的连接会被服务器或代理掐断（浏览器报 ERR_INCOMPLETE_CHUNKED_ENCODING）。
// 每 5 秒发一行注释当心跳：SSE 注释不带 data:，客户端会直接忽略。
setInterval(() => broadcast(encoder.encode(": ping\n\n")), 5000)

// ---------------------------------------------------------------- 4. 模型

async function chat(messages: unknown[], signal: AbortSignal) {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      tools: tools.map((tool) => ({
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        },
      })),
    }),
    signal,
  })
  if (!response.ok) {
    throw new Error(`模型请求失败 ${response.status}: ${await response.text()}`)
  }
  return response.json()
}

// ---------------------------------------------------------------- 5. 主循环

let abort: AbortController | null = null

async function run(task: string) {
  if (abort) {
    send({ type: "error", text: "上一个任务还在跑，先点停止" })
    return
  }
  const controller = new AbortController()
  abort = controller
  // 停止时把等权限的 promise 也解开，否则循环永远停在这一行
  controller.signal.addEventListener(
    "abort",
    () => {
      pendingAsk?.(false)
      pendingAsk = null
    },
    { once: true },
  )

  const messages: any[] = [
    {
      role: "system",
      content: "你是一个编码助手。先读文件再动手；修改前先说计划；用工具验证结果；拿不准就问用户。",
    },
    { role: "user", content: task },
  ]

  try {
    for (let step = 1; step <= MAX_STEPS; step++) {
      send({ type: "step", step })
      const data = await chat(messages, controller.signal)
      const message = data.choices[0].message

      // assistant 消息必须原样放回，工具结果才能和它对应上
      messages.push({
        role: "assistant",
        content: message.content ?? null,
        tool_calls: message.tool_calls,
      })
      if (message.content) send({ type: "text", text: message.content })

      if (!message.tool_calls?.length) {
        send({ type: "done", text: "任务结束" })
        return
      }

      for (const call of message.tool_calls) {
        const tool = tools.find((t) => t.name === call.function.name)
        const args = JSON.parse(call.function.arguments || "{}")
        const target = args.path ?? args.command ?? ""
        send({ type: "tool", name: call.function.name, args })

        let content: string
        if (!tool) {
          content = `错误：没有名为 ${call.function.name} 的工具`
        } else {
          const effect = decide(tool.name, target)
          const allowed = effect === "allow" || (effect === "ask" && (await ask(tool.name, target)))
          if (controller.signal.aborted) {
            content = "已停止"
          } else if (!allowed) {
            content = effect === "deny" ? "该操作被权限规则禁止" : "用户拒绝执行该操作"
          } else {
            content = await tool.run(args, controller.signal).catch((error) => `工具报错：${error.message}`)
          }
        }

        if (!controller.signal.aborted) send({ type: "result", text: content })
        // 用 tool 角色回灌，tool_call_id 把结果和调用对上
        messages.push({ role: "tool", tool_call_id: call.id, content })
      }
    }
    send({ type: "error", text: `达到最大步数 ${MAX_STEPS}，任务仍未完成` })
  } catch (error) {
    const stopped = error instanceof Error && error.name === "AbortError"
    send({ type: "error", text: stopped ? "已停止" : error instanceof Error ? error.message : String(error) })
  } finally {
    abort = null
    send({ type: "idle" })
  }
}

// ---------------------------------------------------------------- 6. 服务器

const page = await Bun.file(new URL("./ui.html", import.meta.url)).text()

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)

    if (url.pathname === "/") {
      return new Response(page, { headers: { "content-type": "text/html; charset=utf-8" } })
    }

    if (url.pathname === "/events") {
      let drop = () => {}
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          clients.add(controller)
          drop = () => clients.delete(controller)
          controller.enqueue(encoder.encode(": connected\n\n"))
        },
        cancel() {
          drop()
        },
      })
      return new Response(stream, {
        headers: { "content-type": "text/event-stream", "cache-control": "no-cache" },
      })
    }

    if (url.pathname === "/run" && req.method === "POST") {
      const { task } = (await req.json()) as { task?: string }
      if (!task?.trim()) return Response.json({ ok: false, error: "任务为空" }, { status: 400 })
      void run(task.trim())
      return Response.json({ ok: true })
    }

    if (url.pathname === "/answer" && req.method === "POST") {
      const { allow } = (await req.json()) as { allow?: boolean }
      pendingAsk?.(Boolean(allow))
      pendingAsk = null
      return Response.json({ ok: true })
    }

    if (url.pathname === "/stop" && req.method === "POST") {
      abort?.abort()
      return Response.json({ ok: true })
    }

    return new Response("not found", { status: 404 })
  },
})

console.log(`agent-ui: http://localhost:${PORT}`)
