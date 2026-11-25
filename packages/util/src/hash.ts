/**
 * 哈希工具。
 * 提供快速哈希与 SHA-256 计算。
 */
import { createHash } from "crypto"

export namespace Hash {
  export function fast(input: string | Buffer): string {
    return createHash("sha1").update(input).digest("hex")
  }

  export function sha256(input: string | Buffer): string {
    return createHash("sha256").update(input).digest("hex")
  }
}
