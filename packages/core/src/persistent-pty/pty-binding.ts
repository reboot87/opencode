/**
 * PTY 原生绑定解析。
 * 解析 PTY 的原生模块绑定路径。
 */
import { binaryPath } from "@opencode/pty"

const binding: string | { readonly path: string; readonly version: string; readonly sha256: string } | undefined =
  binaryPath

export default binding
