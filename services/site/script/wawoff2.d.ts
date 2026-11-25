/**
 * 站点构建脚本：wawoff2·d。
 */
declare module "wawoff2" {
  export function decompress(input: Uint8Array): Promise<Uint8Array>
  export function compress(input: Uint8Array): Promise<Uint8Array>
}
