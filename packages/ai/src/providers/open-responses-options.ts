/**
 * Open Responses 协议选项工具。
 * 定义 Responses 风格 provider 共用的选项输入类型与解析逻辑。
 */
import type { Options } from "../protocols/utils/open-responses-options.js"

export type OpenResponsesOptionsInput = Options & { readonly [key: string]: unknown }
export type OpenResponsesProviderOptionsInput = OpenResponsesOptionsInput
