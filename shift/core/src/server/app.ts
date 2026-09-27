// Building a SHiFT app around the app's own router, one pipeable step at a time:
//
//   routes.pipe(errorPages({ … }), somePlugin, clientAssets(frontend))
//
// Each step wraps the ones before it, so the order of the pipe is the order from inside out.
import { HttpMiddleware, HttpRouter, HttpServer, HttpServerRequest, HttpServerResponse, type HttpApp } from "@effect/platform"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { Config, Effect, Layer, Predicate, type Scope } from "effect"
import { createServer } from "node:http"
import path from "node:path"
import { clientOutDir, type FrontendConfig } from "#protocol"

/**
 * The server half of a plugin: a middleware around the app. It may answer by itself (a redirect), rewrite the request
 * the routes see, set cookies, and add view data (`withViewData`) or replace `Links` for everything inside it.
 * Pipe it in after `errorPages`, so the error pages get what it provides too.
 */
export type ServerPlugin = <E, R>(app: HttpApp.Default<E, R>) => HttpApp.Default<E, R>

export interface ErrorPages<EP, RP> {
  /** The answer when no route matched, or a route failed with an error `isNotFound` accepts. */
  readonly notFound: HttpApp.Default<EP, RP>
  /** The answer when a route failed any other way, or died. The cause is logged. */
  readonly serverError: HttpApp.Default<EP, RP>
  /** Which failures mean "not found" besides unmatched routes: the app's own "no such thing" errors. */
  readonly isNotFound?: (error: unknown) => boolean
}

/** Answers every failure of the routes with a page. */
export const errorPages =
  <EP, RP>(pages: ErrorPages<EP, RP>) =>
  <E, R>(routes: HttpApp.Default<E, R>): HttpApp.Default<EP, R | RP> => {
    const isNotFound = pages.isNotFound ?? (() => false)
    return routes.pipe(
      Effect.catchIf((error) => Predicate.isTagged(error, "RouteNotFound") || isNotFound(error), () => pages.notFound),
      Effect.catchAllCause((cause) => Effect.logError(cause).pipe(Effect.zipRight(pages.serverError)))
    )
  }

/**
 * Serves the built browser files under /assets/ and hands every other request to the app. Only production asks
 * for them; in development Vite serves them from its own port. Pipe it in last: the files need no plugins.
 */
export const clientAssets =
  (config: FrontendConfig) =>
  <E, R>(app: HttpApp.Default<E, R>) => {
    const directory = path.resolve(clientOutDir(config), "assets")
    const file = Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest
      const { pathname } = new URL(request.url, "http://localhost")
      const target = path.resolve(directory, `.${decodeURIComponent(pathname.slice("/assets".length))}`)
      if (!target.startsWith(directory + path.sep)) return HttpServerResponse.empty({ status: 404 })
      return yield* HttpServerResponse.file(target, {
        headers: { "cache-control": "public, max-age=31536000, immutable" }
      }).pipe(Effect.orElseSucceed(() => HttpServerResponse.empty({ status: 404 })))
    })
    return HttpRouter.empty.pipe(HttpRouter.get("/assets/*", file), HttpRouter.all("*", app))
  }

const nodeServer = NodeHttpServer.layerConfig(createServer, { port: Config.integer("PORT").pipe(Config.withDefault(3000)) })

/** What the server provides by itself: the request, and Node's HTTP platform (files, paths). */
type Provided = HttpServerRequest.HttpServerRequest | Scope.Scope | Layer.Layer.Success<typeof nodeServer>

/**
 * Starts the HTTP server on PORT (default 3000) and shuts it down cleanly on Ctrl+C. `layer` provides what the app
 * needs: the views and assets (`frontendDev`, or `viewsBundled` with `assetsFromManifest`) and the app's services.
 */
export const serve = <E, R, LE>(app: HttpApp.Default<E, R>, layer: Layer.Layer<Exclude<R, Provided>, LE>) =>
  HttpServer.serve(app, HttpMiddleware.logger).pipe(
    HttpServer.withLogAddress,
    Layer.provide(nodeServer),
    Layer.provide(layer),
    Layer.launch,
    // The signature above makes `layer` provide everything the app needs; TypeScript can't follow that through Exclude.
    (program) => NodeRuntime.runMain(program as Effect.Effect<never, unknown>)
  )
