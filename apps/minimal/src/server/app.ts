// The routes, wrapped in SHiFT: error pages around them, the built browser files outside.
import { HttpRouter, HttpServerRequest } from "@effect/platform"
import { Effect, Schema } from "effect"
import { clientAssets, errorPages, htmlResponse, responders } from "@shift-stack/core/server"
import { frontend } from "#app/config.ts"
import type { Fragments, Pages } from "#app/views/index.ts"

const { page, fragment } = responders<Pages, Fragments>()

// Kept in memory: a real app would ask a service backed by a database.
let clicks = 0

const routes = HttpRouter.empty.pipe(
  HttpRouter.get("/", Effect.suspend(() => page("home", { clicks }))),
  HttpRouter.get("/about", page("about", {})),
  HttpRouter.post("/clicks", Effect.suspend(() => fragment("clicks", { count: ++clicks })).pipe(Effect.map(htmlResponse))),
  HttpRouter.post(
    "/greet",
    Effect.gen(function* () {
      const { name } = yield* HttpServerRequest.schemaBodyUrlParams(Schema.Struct({ name: Schema.String }))
      const trimmed = name.trim()
      if (!trimmed) return htmlResponse(yield* fragment("greetForm", { error: "Please enter a name." }), 422)
      return htmlResponse(yield* fragment("greetForm", { name: trimmed, greeting: `Hello, ${trimmed}!` }))
    })
  )
)

export const app = routes.pipe(
  errorPages({ notFound: page("notFound", {}, 404), serverError: page("notFound", {}, 500) }),
  clientAssets(frontend)
)
