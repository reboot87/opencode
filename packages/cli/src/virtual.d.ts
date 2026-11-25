/**
 * 虚拟模块类型声明。
 * 声明以虚拟方式内联的模块（如版本信息）的类型。
 */
declare module "virtual:opencode-app-assets" {
  /** Reads the embedded web UI archive (see `app-archive.ts`); each build supplies it from its own embedded files. */
  const read: () => Uint8Array
  export default read
}
