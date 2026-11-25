/**
 * 授权中间件。
 * HttpApi 中间件：校验请求的访问授权。
 */
import { HttpApiMiddleware } from "effect/http-api"
import { UnauthorizedError } from "../errors.js"

export class Authorization extends HttpApiMiddleware.Service<Authorization>()("@opencode/HttpApiAuthorization", {
  error: UnauthorizedError,
}) {}
