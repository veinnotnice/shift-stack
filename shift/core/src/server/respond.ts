// Turning views into responses. Every HTML response varies on the HTMX headers and the layout the browser shows,
// since they decide between the page alone, the whole body and the whole document.
import { HttpServerRequest, HttpServerResponse, type Headers } from "@effect/platform"
import { Context, Effect } from "effect"
import type { ComponentProps } from "svelte"
import { contentTarget, layoutHeader, type Components, type ViewContext } from "#protocol"
import { Assets, Views } from "./views.ts"

/** What the views get to know about the request besides its path. Plugins and the app add to it with `withViewData`. */
export class ViewData extends Context.Reference<ViewData>()("@shift-stack/core/ViewData", {
  defaultValue: (): Readonly<Record<string, unknown>> => ({})
}) {}

/** Runs an effect with more view data: `routes.pipe(withViewData({ theme }))`. */
export const withViewData =
  (data: Readonly<Record<string, unknown>>) =>
  <A, E, R>(self: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
    Effect.flatMap(ViewData, (current) => Effect.provideService(self, ViewData, { ...current, ...data }))

/** How the app's paths become links. A plugin replaces it (the locale prefix); by default a path is its own link. */
export class Links extends Context.Reference<Links>()("@shift-stack/core/Links", {
  defaultValue: () => ({ href: (path: string): string => path })
}) {}

/** A link to a path of the app, as the current request should see it: "/lists/work" → "/de/lists/work". */
export const href = (path: string) => Effect.map(Links, (links) => links.href(path))

/** A boosted navigation into the content target wants the page alone; anything else (reload, history restore) the document. */
export const isPageSwap = (headers: Headers.Headers): boolean =>
  headers["hx-request"] === "true" &&
  headers["hx-target"] === contentTarget &&
  headers["hx-history-restore-request"] !== "true"

export const htmlResponse = (html: string, status = 200): HttpServerResponse.HttpServerResponse =>
  HttpServerResponse.html(html).pipe(
    HttpServerResponse.setStatus(status),
    HttpServerResponse.setHeader("Vary", `HX-Request, HX-Target, ${layoutHeader}`)
  )

const viewContext = Effect.gen(function* () {
  const request = yield* HttpServerRequest.HttpServerRequest
  return { path: request.url, data: yield* ViewData } satisfies ViewContext
})

/**
 * `page` and `fragment`, typed by the app's views: `responders<Pages, Fragments>()`, with the same maps of
 * components the views module was created from.
 */
export const responders = <P extends Components, F extends Components = {}>() => {
  /**
   * A page. A boosted navigation within one layout gets the page alone; one into another layout (from the app's
   * shell to a bare error page, say) gets the whole document, which the client swaps in for the whole body.
   * Anything else (a first load, a reload, a history restore) gets the whole document.
   */
  const page = <K extends keyof P & string>(name: K, props: ComponentProps<P[K]>, status = 200) =>
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest
      const context = yield* viewContext
      const views = yield* Effect.flatMap(Views, (v) => v.load)
      const layout = views.layoutOf(name)
      const swap = isPageSwap(request.headers)
      if (swap && request.headers[layoutHeader.toLowerCase()] === layout) {
        return htmlResponse(views.renderPageContent(context, name, props), status).pipe(
          HttpServerResponse.setHeader(layoutHeader, layout)
        )
      }
      const { head } = yield* Assets
      const document = htmlResponse(views.renderDocument({ ...context, assets: head }, name, props), status)
      if (!swap) return document
      return document.pipe(
        HttpServerResponse.setHeader("HX-Retarget", "body"),
        HttpServerResponse.setHeader("HX-Reswap", "innerHTML"),
        HttpServerResponse.setHeader(layoutHeader, layout)
      )
    })

  /** A fragment's HTML, to answer with (`htmlResponse`) or to send along with other HTML out of band. */
  const fragment = <K extends keyof F & string>(name: K, props: ComponentProps<F[K]>) =>
    Effect.gen(function* () {
      const context = yield* viewContext
      const views = yield* Effect.flatMap(Views, (v) => v.load)
      return views.renderFragment(context, name, props)
    })

  return { page, fragment }
}
