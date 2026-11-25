/**
 * 数据站源码 — Wawoff2D。
 * 模型能力对比站点的实现中负责 Wawoff2D 部分，提供该部分所需的实现与类型定义。
 */
declare module "wawoff2" {
  export function decompress(input: Uint8Array): Promise<Uint8Array>
  export function compress(input: Uint8Array): Promise<Uint8Array>
}
