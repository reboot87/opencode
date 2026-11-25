/**
 * form 接口处理器。
 * 表单接口处理器：提交用户表单。
 */
import { Form } from "@opencode/core/form"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/http-api"
import { Api } from "../api"
import { response } from "../location"

export const FormHandler = HttpApiBuilder.group(Api, "server.form", (handlers) =>
  handlers.handle(
    "form.list",
    Effect.fn(function* () {
      const form = yield* Form.Service
      return yield* response(form.list())
    }),
  ),
)
