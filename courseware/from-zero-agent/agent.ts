/**
 * 从零手写 Agent（约 120 行，不依赖任何 agent 框架）
 *
 * 运行:
 *   export OPENAI_API_KEY=sk-...
 *   bun run agent.ts "读取 package.json，告诉我项目名字"
 *
 * 兼容任何 OpenAI 格式的接口:
 *   OPENAI_BASE_URL=https://api.deepseek.com/v1
 *   MODEL=deepseek-chat
 */

import { createInterface } from "node:readline/promises"

const BASE_URL = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1"
const API_KEY = process.env.OPENAI_API_KEY ?? ""
const MODEL = process.env.MODEL ?? "gpt-4.1-mini"
const MAX_STEPS = 20
const MAX_OUTPUT = 8000

// ---------------------------------------------------------------- 1. 工具

type Tool = {
  name: string
  description: string
  parameters: Record<string, unknown>
  run: (args: Record<string, string>) => Promise<string>
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
    run: async (args) => {
      const cmd =
        process.platform === "win32"
          ? ["powershell", "-NoProfile", "-Command", `[Console]::OutputEncoding=[Text.Encoding]::UTF8; ${args.command}`]
          : ["bash", "-lc", args.command]
      const result = Bun.spawnSync(cmd, { stdout: "pipe", stderr: "pipe" })
      const output = result.stdout.toString() + result.stderr.toString()
      return truncate(output.trim() || `(exit ${result.exitCode}，无输出)`)
    },
  },
]

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

async function confirm(question: string) {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const answer = await rl.question(question)
  rl.close()
  return answer.trim().toLowerCase() === "y"
}

// ---------------------------------------------------------------- 3. 模型

async function chat(messages: unknown[]) {
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
  })
  if (!response.ok) {
    throw new Error(`模型请求失败 ${response.status}: ${await response.text()}`)
  }
  return response.json()
}

// ---------------------------------------------------------------- 4. 主循环

const task = Bun.argv.slice(2).join(" ")
if (!task) {
  console.error('用法: bun run agent.ts "你的任务"')
  process.exit(1)
}

const messages: any[] = [
  {
    role: "system",
    content: "你是一个编码助手。先读文件再动手；修改前先说计划；用工具验证结果；拿不准就问用户。",
  },
  { role: "user", content: task },
]

for (let step = 1; step <= MAX_STEPS; step++) {
  const data = await chat(messages)
  const message = data.choices[0].message

  // assistant 消息必须原样放回，工具结果才能和它对应上
  messages.push({
    role: "assistant",
    content: message.content ?? null,
    tool_calls: message.tool_calls,
  })

  // 没有工具调用 = 模型认为任务完成了
  if (!message.tool_calls?.length) {
    console.log(`\n${message.content}`)
    process.exit(0)
  }

  for (const call of message.tool_calls) {
    const tool = tools.find((t) => t.name === call.function.name)
    const target = (() => {
      try {
        const args = JSON.parse(call.function.arguments || "{}")
        return args.path ?? args.command ?? ""
      } catch {
        return ""
      }
    })()

    let content: string
    if (!tool) {
      content = `错误：没有名为 ${call.function.name} 的工具`
    } else {
      const effect = decide(tool.name, target)
      const allowed =
        effect === "allow" || (effect === "ask" && (await confirm(`允许 ${tool.name} ${target} ? [y/N] `)))
      if (!allowed) {
        content = effect === "deny" ? "该操作被权限规则禁止" : "用户拒绝执行该操作"
      } else {
        content = await tool
          .run(JSON.parse(call.function.arguments || "{}"))
          .catch((error) => `工具报错：${error.message}`)
      }
    }

    // 用 tool 角色回灌，tool_call_id 把结果和调用对上
    messages.push({ role: "tool", tool_call_id: call.id, content })
  }
}

console.log(`达到最大步数 ${MAX_STEPS}，任务仍未完成。`)
