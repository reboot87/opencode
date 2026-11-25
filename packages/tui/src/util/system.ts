/**
 * 终端工具 — System。
 * 终端界面的通用工具函数中负责 System 部分，提供该部分所需的实现与类型定义。
 */
import { release } from "node:os"

export function describeOS() {
  const name =
    process.platform === "darwin"
      ? "macOS"
      : process.platform === "win32"
        ? "Windows"
        : process.platform === "linux"
          ? "Linux"
          : process.platform
  // Under emulation on Windows ARM64, process.arch reads x64 but PROCESSOR_IDENTIFIER still names the ARM host.
  const emulated =
    process.platform === "win32" && process.arch === "x64" && process.env.PROCESSOR_IDENTIFIER?.startsWith("ARM")
  return `${name} ${release()} (${process.arch}${emulated ? ", emulated on ARM64" : ""})`
}

export function describeTerminal() {
  const program = process.env.TERM_PROGRAM || process.env.TERM || "unknown"
  const version = process.env.TERM_PROGRAM_VERSION ? ` ${process.env.TERM_PROGRAM_VERSION}` : ""
  const multiplexer = process.env.TMUX ? " in tmux" : process.env.STY ? " in screen" : ""
  return `${program}${version}${multiplexer}`
}
