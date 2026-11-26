// 本地假模型 + 真 UI，用来在浏览器里点一遍（不连真模型、不花钱）
//
//   bun run demo-local.ts        TS 后端（agent-ui.ts）
//   bun run demo-local.ts cpp    C++ 后端（cpp/agent.exe --ui，同一个 ui.html）
const MODEL_PORT = 4398
const UI_PORT = 4322
const CPP = process.argv[2] === "cpp"

const model = Bun.serve({
  port: MODEL_PORT,
  async fetch(req) {
    const body = (await req.json()) as { messages: Array<{ role: string; content?: string }> }
    const done = body.messages.filter((m) => m.role === "tool").length

    if (done === 0) {
      return Response.json({
        choices: [
          {
            message: {
              role: "assistant",
              content: "先看一下 read_file 这个工具自己是怎么实现的，再决定底线画在哪。",
              tool_calls: [
                {
                  id: "c1",
                  type: "function",
                  function: { name: "read_file", arguments: JSON.stringify({ path: "tools/read_file.lua" }) },
                },
              ],
            },
          },
        ],
      })
    }

    if (done === 1) {
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
              "看完了。read_file.lua 只做一件事：把参数交给 host.read，失败就回一句错误。\n" +
              "我已经把备忘写进 demo-note.txt。下一步可以把工具换成你自己的。",
          },
        },
      ],
    })
  },
})

const baseEnv = {
  ...process.env,
  PORT: String(UI_PORT),
  OPENAI_BASE_URL: `http://127.0.0.1:${MODEL_PORT}/v1`,
  OPENAI_API_KEY: "test",
  MODEL: "mock",
}

const app = CPP
  ? Bun.spawn(["./agent.exe", "--ui"], {
      // 工具描述里的 script 是 "tools/xxx.lua"，所以从 cpp/ 起
      cwd: "cpp",
      env: { ...baseEnv, UI_HTML: "../ui.html" },
      stdout: "inherit",
      stderr: "inherit",
    })
  : Bun.spawn(["bun", "run", "agent-ui.ts"], {
      env: baseEnv,
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
