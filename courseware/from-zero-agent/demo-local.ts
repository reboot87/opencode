// 本地假模型 + 真 UI，用来在浏览器里点一遍（不连真模型、不花钱）
const MODEL_PORT = 4398
const UI_PORT = 4322

let calls = 0

const model = Bun.serve({
  port: MODEL_PORT,
  async fetch(req) {
    calls++
    const body = (await req.json()) as { messages: Array<{ role: string; content?: string }> }
    const tool = body.messages.find((m) => m.role === "tool")

    if (calls === 1) {
      return Response.json({
        choices: [
          {
            message: {
              role: "assistant",
              content: "先看一下 agent.ts 的开头，再决定底线画在哪。",
              tool_calls: [
                {
                  id: "c1",
                  type: "function",
                  function: { name: "read_file", arguments: JSON.stringify({ path: "agent.ts" }) },
                },
              ],
            },
          },
        ],
      })
    }

    if (calls === 2) {
      return Response.json({
        choices: [
          {
            message: {
              role: "assistant",
              content: null,
              tool_calls: [
                {
                  id: "c2",
                  type: "function",
                  function: {
                    name: "write_file",
                    arguments: JSON.stringify({
                      path: "demo-note.txt",
                      content: "从零手写 agent 的第一步：先让它能跑。",
                    }),
                  },
                },
              ],
            },
          },
        ],
      })
    }

    return Response.json({
      choices: [
        {
          message: {
            role: "assistant",
            content:
              "看完了。agent.ts 的主循环是「请求模型 → 有工具调用就执行 → 把结果塞回去 → 再问一次」。\n" +
              "我已经把备忘写进 demo-note.txt。下一步可以把工具换成你自己的。",
          },
        },
      ],
    })
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
  stdout: "inherit",
  stderr: "inherit",
})

const stop = () => {
  app.kill()
  model.stop(true)
  process.exit(0)
}
process.on("SIGTERM", stop)
process.on("SIGINT", stop)

console.log(`demo ready: http://localhost:${UI_PORT}`)
await new Promise(() => {})
