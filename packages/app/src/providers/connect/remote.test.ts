/**
 * Provider 连接 — RemoteTest。
 * 连接 provider 的授权界面中负责 RemoteTest 部分，提供该部分所需的实现与类型定义。
 */
import { expect, test } from "bun:test"
import { authServerName } from "./remote"

const contributed = {
  type: "plugin",
  key: "ssh:production",
  plugin: "ssh",
  status: { type: "ready", http: { url: "http://127.0.0.1:4096" } },
  authenticate: () => false,
  managed: true,
} as const

test("SSH disclosure uses the remote identity even with a loopback proxy", () => {
  expect(authServerName({ ...contributed, displayName: "Production server" })).toBe("Production server")
})

test.each([
  {
    name: "local Desktop",
    server: { type: "sidecar", variant: "base", http: { url: "http://127.0.0.1:4096" } } as const,
    expected: undefined,
  },
  {
    name: "localhost HTTP",
    server: { type: "http", http: { url: "http://localhost:4096" } } as const,
    expected: undefined,
  },
  {
    name: "IPv4 loopback HTTP",
    server: { type: "http", http: { url: "http://127.0.0.1:4096" } } as const,
    expected: undefined,
  },
  {
    name: "IPv6 loopback HTTP",
    server: { type: "http", http: { url: "http://[::1]:4096" } } as const,
    expected: undefined,
  },
  {
    name: "WSL",
    server: { ...contributed, key: "wsl:Ubuntu", plugin: "wsl", displayName: "Ubuntu" } as const,
    expected: "Ubuntu",
  },
  {
    name: "remote HTTP",
    server: { type: "http", http: { url: "https://production.example" } } as const,
    expected: "production.example",
  },
])("remote disclosure for a $name connection names $expected", ({ server, expected }) => {
  expect(authServerName(server)).toBe(expected)
})
