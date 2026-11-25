/**
 * 机器模块统一导出。
 * 集中导出机器相关类型与服务。
 */
export * as Machine from "./index.js"

export { type Connection, ConnectionInfo, type Interface, make, NotSent, ProcessLost, Unknown } from "./driver.js"
export { FileCall, FromWorker, Hello, Instance, ProcessID, Signal, ToWorker } from "./wire.js"
