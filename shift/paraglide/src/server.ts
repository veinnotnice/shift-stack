// The server half of Paraglide for SHiFT. Every page lives under its locale's prefix (/en/…, /de/…). A request
// without one is redirected to the locale Paraglide's strategies pick; the routes see the path without it.
import { HttpServerRequest, HttpServerResponse } from "@effect/platform"
import { Context, Effect } from "effect"
import { Links, withViewData, type ServerPlugin } from "@shift-stack/core/server"

/** The part of a compiled Paraglide runtime (runtime.js) the server uses. Pass the module: `import * as runtime`. */
export interface ServerRuntime<L extends string> {
  readonly cookieName: string
  readonly cookieMaxAge: number
  extractLocaleFromUrl(url: URL | string): L | undefined
  extractLocaleFromRequest(request: Request): L
  localizeUrl(url: URL | string, options?: { locale?: L }): URL
  deLocalizeUrl(url: URL | string): URL
  localizeHref(href: string, options?: { locale?: L }): string
}

class RequestLocale extends Context.Reference<RequestLocale>()("@shift-stack/paraglide/RequestLocale", {
  defaultValue: (): string | undefined => undefined
}) {}

export interface Paraglide<L extends string> {
  /** Pipe it in after `errorPages` and any plugin that renders or links: `routes.pipe(errorPages(…), i18n.plugin)`. */
  readonly plugin: ServerPlugin
  /** The current request's locale, for messages rendered outside the views: `m.saved({}, { locale })`. */
  readonly locale: Effect.Effect<L>
}

export const paraglide = <L extends string>(runtime: ServerRuntime<L>): Paraglide<L> => {
  const plugin: ServerPlugin = (app) =>
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest
      const url = new URL(request.url, "http://localhost")
      const locale = runtime.extractLocaleFromUrl(url)

      if (!locale) {
        if (request.method !== "GET" && request.method !== "HEAD") return HttpServerResponse.empty({ status: 404 })
        // The app's Paraglide strategies pick the locale: typically the cookie, then Accept-Language, then the base locale.
        const preferred = runtime.extractLocaleFromRequest(new Request(url, { headers: request.headers }))
        const target = runtime.localizeUrl(url, { locale: preferred })
        return HttpServerResponse.redirect(`${target.pathname}${target.search}`, {
          status: 302,
          headers: { vary: "Cookie, Accept-Language" }
        })
      }

      // The routes see the path without its prefix, so they are written once for every locale.
      const unprefixed = runtime.deLocalizeUrl(url)
      const response = yield* app.pipe(
        withViewData({ locale }),
        Effect.provideService(Links, { href: (path) => runtime.localizeHref(path, { locale }) }),
        Effect.provideService(RequestLocale, locale),
        Effect.provideService(HttpServerRequest.HttpServerRequest, request.modify({ url: `${unprefixed.pathname}${unprefixed.search}` }))
      )
      return HttpServerResponse.unsafeSetCookie(response, runtime.cookieName, locale, {
        path: "/",
        maxAge: `${runtime.cookieMaxAge} seconds`,
        sameSite: "lax"
      })
    })

  const locale = Effect.flatMap(RequestLocale, (current) =>
    current === undefined ? Effect.dieMessage("No locale: the Paraglide plugin is not around this request") : Effect.succeed(current as L)
  )

  return { plugin, locale }
}
