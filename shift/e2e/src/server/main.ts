// The fixture app's server, built for production like an app's: the routes the tests drive, on PORT.
import { HttpRouter, HttpServerRequest } from "@effect/platform"
import { Effect, Layer, Schema } from "effect"
import {
  assetsFromManifest,
  clientAssets,
  errorPages,
  htmlResponse,
  refresh,
  responders,
  serve,
  viewsBundled
} from "@shift-stack/core/server"
import { frontend } from "#app/config.ts"
import type { Fragments, Pages } from "#app/views/index.ts"

const { page, fragment } = responders<Pages, Fragments>()

const query = Effect.map(HttpServerRequest.HttpServerRequest, (request) => new URL(request.url, "http://localhost").searchParams)

let loads = 0

const routes = HttpRouter.empty.pipe(
  HttpRouter.get("/", page("home", {})),
  HttpRouter.get("/second", page("second", {})),
  HttpRouter.get("/slots", page("slots", {})),
  HttpRouter.post(
    "/name",
    Effect.gen(function* () {
      const { name } = yield* HttpServerRequest.schemaBodyUrlParams(Schema.Struct({ name: Schema.String }))
      const value = name.trim()
      if (!value) return htmlResponse(yield* fragment("nameForm", { value, error: "Required" }), 422)
      return htmlResponse(yield* fragment("nameForm", { value, saved: true }))
    })
  ),
  HttpRouter.get(
    "/slow",
    Effect.gen(function* () {
      const params = yield* query
      yield* Effect.sleep(Number(params.get("ms") ?? 0))
      return yield* page("slow", { label: params.get("label") ?? "" })
    })
  ),
  HttpRouter.get("/swap", page("swap", {})),
  HttpRouter.get(
    "/block",
    Effect.gen(function* () {
      const n = Number((yield* query).get("n") ?? 1)
      return htmlResponse(yield* fragment("block", { n }))
    })
  ),
  HttpRouter.get("/reload", Effect.suspend(() => page("reload", { loads: ++loads }))),
  HttpRouter.post("/reload", Effect.succeed(refresh))
)

const app = routes.pipe(
  errorPages({ notFound: page("missing", {}, 404), serverError: page("missing", {}, 500) }),
  clientAssets(frontend)
)

serve(app, Layer.merge(viewsBundled(() => import("#app/views/index.ts")), assetsFromManifest(frontend)))
