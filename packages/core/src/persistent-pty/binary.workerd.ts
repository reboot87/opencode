/**
 * 持久化 PTY 二进制（Workerd）。
 * 在 workerd 运行时标记持久化 PTY 不可用。
 */
export const available = false

export async function resolveBinary(): Promise<string> {
  throw new Error("Persistent PTYs are unavailable in this runtime")
}
