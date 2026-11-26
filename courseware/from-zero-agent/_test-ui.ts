// 用本地假模型验证两个后端的同一个协议：事件流、页面权限、停止
//
//   bun run _test-ui.ts
//
// 先测 agent-ui.ts（TS），再测 cpp/agent.exe --ui（没编译就跳过）。
// 页面只有一份 ui.html，所以这里断言的东西对两边一样。

import { existsSync } from "node:fs"

const MODEL_PORT = 4399
const FILE = "ui_test.txt"
const SLOW_MS = 3000

let modelCalls = 0

const model = Bun.serve({
  port: MODEL_PORT,
  async fetch(req) {
    modelCalls++
    const body = (await req.json()) as { messages: Array<{ role: string; content?: string }> }

    // 第三次以后装死：用来测「点停止能不能打断正在等的请求」
    if (modelCalls > 2) {
      await Bun.sleep(SLOW_MS)
      return Response.json({ choices: [{ message: { role: "assistant", content: "太慢了" } }] })
    }

    const toolMessage = body.messages.find((m) => m.role === "tool")
    if (!toolMessage) {
      return Response.json({
        choices: [
          {
            message: {
              role: "assistant",
              content: "先写个文件。",
              tool_calls: [
                {
                  id: "call_1",
                  type: "function",
                  function: { name: "write_file", arguments: JSON.stringify({ path: FILE, content: "hello" }) },
                },
              ],
            },
          },
        ],
      })
    }
    return Response.json({ choices: [{ message: { role: "assistant", content: "DONE:" + toolMessage.content } }] })
  },
})

type Frame = { type: string; text?: string; name?: string; target?: string; step?: number }

let failed = false
function check(name: string, ok: boolean, detail = "") {
  console.log((ok ? "PASS " : "FAIL ") + name + (ok ? "" : "  " + detail))
  if (!ok) failed = true
}

async function runSuite(label: string, port: number, app: Bun.Subprocess, dir: string) {
  const base = `http://127.0.0.1:${port}`

  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(base + "/")).ok) break
    } catch {}
    await Bun.sleep(100)
  }

  if (app.exitCode !== null) {
    const err = await new Response(app.stderr as ReadableStream).text().catch(() => "")
    throw new Error(`${label} 进程退出了 code=${app.exitCode} ${err.slice(0, 300)}`)
  }

  const events: Frame[] = []
  const stream = await fetch(base + "/events")
  const reader = stream.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  void (async () => {
    while (true) {
      const { done, value } = await reader.read()
      if (done) return
      buffer += decoder.decode(value, { stream: true })
      let cut = buffer.indexOf("\n\n")
      while (cut >= 0) {
        const frame = buffer.slice(0, cut)
        buffer = buffer.slice(cut + 2)
        const data = frame.split("\n").find((line) => line.startsWith("data: "))
        if (data) events.push(JSON.parse(data.slice(6)))
        cut = buffer.indexOf("\n\n")
      }
    }
  })()

  async function next(type: string, timeout = 8000): Promise<Frame> {
    const started = Date.now()
    while (Date.now() - started < timeout) {
      const index = events.findIndex((event) => event.type === type)
      if (index >= 0) return events.splice(index, 1)[0]
      await Bun.sleep(20)
    }
    throw new Error(`等待事件 ${type} 超时`)
  }

  const post = (path: string, body: unknown) =>
    fetch(base + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })

  const file = `${dir}/${FILE}`

  try {
    // ---- 1. 正常跑一轮：工具 → 权限 → 结果 → 收尾
    modelCalls = 0
    await post("/run", { task: "写一个文件" })

    const ask = await next("ask")
    check(`${label}: 权限问题推到页面`, ask.name === "write_file" && ask.target === FILE, JSON.stringify(ask))

    await post("/answer", { allow: true })

    const result = await next("result")
    check(`${label}: 允许后工具真的执行`, result.text === `已写入 ${FILE}（5 字）`, String(result.text))
    check(`${label}: 文件落盘`, existsSync(file) && (await Bun.file(file).text()) === "hello")

    const done = await next("done")
    check(`${label}: 模型收尾后推 done`, done.text === "任务结束", String(done.text))

    // ---- 2. 模型很慢时点停止
    events.length = 0
    modelCalls = 2
    await post("/run", { task: "再跑一次" })
    await Bun.sleep(300)
    await post("/stop")

    const error = await next("error", 10000)
    check(`${label}: 停止能结束当前任务`, error.text === "已停止", String(error.text))

    // ---- 3. 页面点拒绝 = 工具不执行
    events.length = 0
    modelCalls = 0
    await post("/run", { task: "再写一次" })
    await next("ask")
    await post("/answer", { allow: false })
    const refused = await next("result")
    check(`${label}: 点拒绝后工具不执行`, refused.text === "用户拒绝执行该操作", String(refused.text))
  } catch (error) {
    check(`${label}: 流程跑完`, false, error instanceof Error ? error.message : String(error))
  } finally {
    await reader.cancel().catch(() => {})
    app.kill()
    if (existsSync(file)) await Bun.file(file).delete()
  }
}

const env = {
  OPENAI_BASE_URL: `http://127.0.0.1:${MODEL_PORT}/v1`,
  OPENAI_API_KEY: "test",
  MODEL: "mock",
}

// ---- 后端 1：TypeScript
await runSuite(
  "ts",
  4321,
  Bun.spawn(["bun", "run", "agent-ui.ts"], {
    env: { ...process.env, ...env, PORT: "4321" },
    stdout: "pipe",
    stderr: "pipe",
  }),
  ".",
)

// ---- 后端 2：C++（同一个页面、同一套断言）
if (existsSync("cpp/agent.exe")) {
  await runSuite(
    "cpp",
    4324,
    Bun.spawn(["./agent.exe", "--ui"], {
      cwd: "cpp",
      env: { ...process.env, ...env, PORT: "4324", UI_HTML: "../ui.html" },
      stdout: "pipe",
      stderr: "pipe",
    }),
    "cpp",
  )
} else {
  console.log("SKIP cpp 后端还没编译（先跑 cpp\\build.bat）")
}

model.stop(true)
process.exit(failed ? 1 : 0)
