/**
 * MCP·提示词测试夹具。
 *
 * 为核心测试提供稳定可复用的夹具数据与依赖桩。
 */
import { Server } from "@modelcontextprotocol/server"
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio"

const server = new Server({ name: "prompts", version: "1.0.0" }, { capabilities: { prompts: {} } })

server.setRequestHandler("prompts/list", ({ params }) =>
  Promise.resolve(
    params?.cursor === "page-2"
      ? { prompts: [{ name: "second", description: "Second prompt" }] }
      : {
          prompts: [
            {
              name: "first",
              description: "First prompt",
              arguments: [{ name: "topic", description: "Topic to explain", required: true }],
            },
          ],
          nextCursor: "page-2",
        },
  ),
)

server.setRequestHandler("prompts/get", ({ params }) =>
  Promise.resolve({
    messages: [{ role: "user", content: { type: "text", text: params.arguments?.topic ?? "missing" } }],
  }),
)

await server.connect(new StdioServerTransport())
