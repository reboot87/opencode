/**
 * Schema 错误中间件。
 * HttpApi 中间件：把请求/响应校验失败转换为统一的 Schema 错误响应。
 */
import { HttpApiMiddleware } from "effect/http-api"
import { InvalidRequestError } from "../errors.js"

export class SchemaErrorMiddleware extends HttpApiMiddleware.Service<SchemaErrorMiddleware>()(
  "@opencode/HttpApiSchemaError",
  { error: InvalidRequestError },
) {}
