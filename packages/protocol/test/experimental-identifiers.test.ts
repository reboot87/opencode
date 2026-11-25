/**
 * 实验性·identifiers的测试。
 *
 * 被测模块：@opencode/protocol/experimental-identifiers
 *
 * 覆盖该模块的核心行为与边界条件。
 */
import { expect, test } from "bun:test"
import { OpenApi } from "effect/http-api"
import { ClientApi } from "../src/client.js"

const methods = ["get", "put", "post", "delete", "patch", "head", "options", "trace"] as const

test("routes under /api/experimental, and only those, have experimental.* identifiers", () => {
  const operations = Object.entries(OpenApi.fromApi(ClientApi).paths).flatMap(([path, item]) =>
    methods.flatMap((method) => {
      const operation = item[method]
      return operation ? [{ path, identifier: operation.operationId }] : []
    }),
  )
  const offenders = operations
    .filter(
      ({ path, identifier }) =>
        (path === "/api/experimental" || path.startsWith("/api/experimental/")) !==
        identifier.startsWith("experimental."),
    )
    .map(({ path, identifier }) => `${identifier} ${path}`)

  expect(operations.length).toBeGreaterThan(100)
  expect(offenders).toEqual([])
})
