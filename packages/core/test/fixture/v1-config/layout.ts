/**
 * 布局测试夹具。
 *
 * 提供 v1 格式的配置样例，用于配置迁移与兼容校验。
 */
export * as ConfigLayoutV1 from "./layout"

import { Schema } from "effect"

export const Layout = Schema.Literals(["auto", "stretch"]).annotate({ identifier: "LayoutConfig" })
export type Layout = Schema.Schema.Type<typeof Layout>
