// 用本地假模型验证 agent-ui：事件流、页面权限、停止
//
//   bun run _test-ui.ts
//
// 覆盖三件事：
//   1. 工具事件 + 结果事件按顺序到达浏览器
//   2. 权限走 HTTP 答复（allow），文件真的写下去
//   3. 模型很慢时点停止，run 立刻结束并回「已停止」

const MODEL_PORT = 4399
const UI_PORT = 4321
const FILE = "ui_test.txt"

type Event = { type: string; text?: string; name?: string; target?: string; args?: unknown; step?: number }

let modelCalls = 0

const model = Bun.serve({
  port: MODEL_PORT,
  async fetch(req) {
    modelCalls++
    const body = (await req.json()) as { messages: Array<{ role: string; content?: string }> }

    // 第三次以后装死：用来测「点停止能不能打断正在等的请求」
    if (modelCalls > 2) {
      await Bun.sleep(10_000)
      return Response.json({ choices: [{ message: { role: "assistant", content: "太慢了" } }] })
    }

    const toolMessage = body.messages.find((m) => m.role === "tool")
    if (!toolMessage) {
      return Response.json({
        choices: [
          {
            message: {
              role: "assistant",
              content: null,
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

const app = Bun.spawn(["bun", "run", "agent-ui.ts"], {
  env: {
    ...process.env,
    PORT: String(UI_PORT),
    OPENAI_BASE_URL: `http://127.0.0.1:${MODEL_PORT}/v1`,
    OPENAI_API_KEY: "test",
    MODEL: "mock",
  },
  stdout: "pipe",
  stderr: "pipe",
})

const base = `http://127.0.0.1:${UI_PORT}`

// 等服务器起来
for (let i = 0; i < 100; i++) {
  try {
    if ((await fetch(base + "/")).ok) break
  } catch {}
  await Bun.sleep(100)
}

// 订阅事件流
const events: Event[] = []
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

async function next(type: string, timeout = 8000): Promise<Event> {
  const started = Date.now()
  while (Date.now() - started < timeout) {
    const index = events.findIndex((event) => event.type === type)
    if (index >= 0) return events.splice(index, 1)[0]
    await Bun.sleep(20)
  }
  throw new Error(`等待事件 ${type} 超时`)
}

let failed = false
function check(name: string, ok: boolean, detail = "") {
  console.log((ok ? "PASS " : "FAIL ") + name + (ok ? "" : "  " + detail))
  if (!ok) failed = true
}

const post = (path: string, body: unknown) =>
  fetch(base + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })

// ---- 1. 正常跑一轮：工具 → 权限 → 结果 → 收尾
await post("/run", { task: "写一个文件" })

const ask = await next("ask")
check("权限问题推到页面，而不是卡 stdin", ask.name === "write_file" && ask.target === FILE, JSON.stringify(ask))

await post("/answer", { allow: true })

const result = await next("result")
check("允许后工具真的执行", result.text === `已写入 ${FILE}（5 字）`, String(result.text))
check("文件落盘", (await Bun.file(FILE).text()) === "hello")

const done = await next("done")
check("模型收尾后推 done", done.text === "任务结束", String(done.text))

// ---- 2. 模型很慢时点停止
events.length = 0
await post("/run", { task: "再跑一次" })
await Bun.sleep(300)
await post("/stop")

const error = await next("error")
check("停止能打断正在等待的请求", error.text === "已停止", String(error.text))

// ---- 3. 空闲时等权限 → 页面答复拒绝
events.length = 0
modelCalls = 0
await post("/run", { task: "再写一次" })
await next("ask")
await post("/answer", { allow: false })
const refused = await next("result")
check("页面点拒绝 = 工具不执行", refused.text === "用户拒绝执行该操作", String(refused.text))

app.kill()
model.stop(true)
await Bun.file(FILE).delete()
process.exit(failed ? 1 : 0)
