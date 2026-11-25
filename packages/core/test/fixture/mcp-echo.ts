/**
 * MCP·回显测试夹具。
 *
 * 为核心测试提供稳定可复用的夹具数据与依赖桩。
 */
import { createMcpHandler, Server } from "@modelcontextprotocol/server"

/** A web-standard MCP server with one `echo` tool, for tests that route MCP HTTP through their own fetch. */
export const echoMcpHandler = () =>
  createMcpHandler(() => {
    const protocol = new Server({ name: "echo", version: "1.0.0" }, { capabilities: { tools: {} } })
    protocol.setRequestHandler("tools/list", () =>
      Promise.resolve({ tools: [{ name: "echo", inputSchema: { type: "object" as const, properties: {} } }] }),
    )
    protocol.setRequestHandler("tools/call", (request) =>
      Promise.resolve({ content: [{ type: "text" as const, text: `called ${request.params.name}` }] }),
    )
    return protocol
  })
