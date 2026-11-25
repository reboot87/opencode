/**
 * 命令 API 分组。
 * 定义自定义命令的列举与执行端点。
 */
import { Command } from "@opencode/schema/command"
import { Location } from "@opencode/schema/location"
import { Schema } from "effect"
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/http-api"
import { LocationQuery, locationQueryOpenApi } from "./location.js"

export const CommandGroup = HttpApiGroup.make("server.command")
  .add(
    HttpApiEndpoint.get("command.list", "/api/command", {
      query: LocationQuery,
      success: Location.response(Schema.Array(Command.Info)),
    })
      .annotateMerge(locationQueryOpenApi)
      .annotateMerge(
        OpenApi.annotations({
          identifier: "command.list",
          summary: "List commands",
          description: "Retrieve currently registered commands.",
        }),
      ),
  )
  .annotateMerge(
    OpenApi.annotations({
      title: "command",
      description: "Experimental command routes.",
    }),
  )
