/**
 * MCP 配置类型。
 * 定义 mcp 配置项的 Schema（本地与远程服务器）。
 */
export * as ConfigMCP from "./mcp.js"

import { Schema } from "effect"
import { Mcp } from "../mcp.js"
import { optional } from "../schema.js"

export const Timeout = Mcp.TimeoutConfig
export type Timeout = Mcp.TimeoutConfig
export const Local = Mcp.LocalConfig
export type Local = Mcp.LocalConfig
export const OAuth = Mcp.OAuthConfig
export type OAuth = Mcp.OAuthConfig
export const Remote = Mcp.RemoteConfig
export type Remote = Mcp.RemoteConfig
export const Server = Mcp.ServerConfig
export const Protocol = Mcp.Protocol
export type Protocol = Mcp.Protocol

export class Info extends Schema.Class<Info>("Config.MCP")({
  timeout: Timeout.pipe(optional),
  servers: Schema.Record(Schema.String, Server).pipe(optional),
}) {}
