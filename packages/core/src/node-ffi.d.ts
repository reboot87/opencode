/**
 * Node FFI 的类型声明。
 * 声明通过 node-ffi 调用原生库（如 kernel32.dll）的 dlopen 与整数读取接口。
 */
declare module "node:ffi" {
  type Signature = {
    readonly arguments?: readonly string[]
    readonly return?: string
  }

  type ForeignFunction = (...args: ReadonlyArray<unknown>) => number | bigint

  export function dlopen(
    path: string,
    definitions: Readonly<Record<string, Signature>>,
  ): {
    readonly lib: { close(): void }
    readonly functions: Readonly<Record<string, ForeignFunction>>
  }

  export function getInt32(pointer: number | bigint, offset?: number): number
}
