/**
 * 持久化 PTY 二进制（Node）。
 * 在 Node 运行时使用 opencode-pty 二进制。
 */
export const available = true

export async function resolveBinary() {
  return process.env.OPENCODE_PTY_BIN || "opencode-pty"
}
