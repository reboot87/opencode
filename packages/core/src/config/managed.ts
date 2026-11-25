/**
 * 托管配置文档。
 * 定义托管配置的 Document 扩展类型。
 */
export * as ConfigManaged from "./managed.js"

import { Config } from "@opencode/schema/config"

/** A document from managed configuration: the system config directory or MDM managed preferences. */
export class Document extends Config.Document.extend<Document>("Config.ManagedDocument")({}) {}
