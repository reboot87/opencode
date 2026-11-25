// 临时测试：用本地假模型验证循环、工具调用与结果回灌
const server = Bun.serve({
  port: 4399,
  async fetch(req) {
    const body: any = await req.json()
    const toolMessage = body.messages.find((m: any) => m.role === "tool")
    const hasTools = Array.isArray(body.tools) && body.tools.length === 3
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
                  function: { name: "read_file", arguments: JSON.stringify({ path: "agent.ts" }) },
                },
              ],
            },
          },
        ],
      })
    }
    console.error("tools advertised:", hasTools, "| tool result starts:", toolMessage.content.slice(0, 12))
    return Response.json({
      choices: [{ message: { role: "assistant", content: "OK:" + toolMessage.content.slice(0, 20) } }],
    })
  },
})

const proc = Bun.spawn(["bun", "run", "agent.ts", "读取 agent.ts 的开头"], {
  env: {
    ...process.env,
    OPENAI_BASE_URL: `http://127.0.0.1:${server.port}/v1`,
    OPENAI_API_KEY: "test",
    MODEL: "mock",
  },
  stdout: "pipe",
  stderr: "pipe",
})

const out = await new Response(proc.stdout).text()
const err = await new Response(proc.stderr).text()
const code = await proc.exited
console.log(out.trim())
console.error(err.trim())
server.stop()
process.exit(code)
