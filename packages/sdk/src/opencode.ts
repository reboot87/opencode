/**
 * SDK Promise 入口。
 * 再导出 Promise 风格的创建选项与日志类型。
 */
import { PromiseSdk } from "./promise"

export type { LogEntry, LogLevel, LogOptions, LogWriter } from "./logging"

export type CreateOptions = PromiseSdk.CreateOptions
export type InstanceOptions = PromiseSdk.InstanceOptions
export type InstanceConfiguration = PromiseSdk.InstanceConfiguration
export type Interface = PromiseSdk.Interface

export const create = (options: CreateOptions = {}) => PromiseSdk.create(options)
