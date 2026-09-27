import { HttpApp, HttpServerRequest, HttpServerResponse } from "@effect/platform"
import { Effect } from "effect"
import { describe, expect, it } from "vitest"
import { href, ViewData } from "@shift-stack/core/server"
import { paraglide, type ServerRuntime } from "@shift-stack/paraglide/server"

type Locale = "en" | "de"

// A runtime with the "url, cookie, base locale" strategies, as Paraglide compiles them.
const runtime: ServerRuntime<Locale> = {
  cookieName: "LOCALE",
  cookieMaxAge: 60,
  extractLocaleFromUrl: (url) => new URL(url, "http://x").pathname.match(/^\/(en|de)(\/|$)/)?.[1] as Locale | undefined,
  extractLocaleFromRequest: (request) => (request.headers.get("cookie")?.match(/LOCALE=(en|de)/)?.[1] as Locale) ?? "en",
  localizeUrl: (url, options) => {
    const target = new URL(url, "http://x")
    target.pathname = `/${options?.locale ?? "en"}${target.pathname}`
    return target
  },
  deLocalizeUrl: (url) => {
    const target = new URL(url, "http://x")
    target.pathname = target.pathname.replace(/^\/(en|de)(?=\/|$)/, "") || "/"
    return target
  },
  localizeHref: (path, options) => `/${options?.locale ?? "en"}${path}`
}

const i18n = paraglide(runtime)

// Tells what the routes see: the path, the locale, a link and the view data.
const echo = Effect.gen(function* () {
  const request = yield* HttpServerRequest.HttpServerRequest
  return yield* HttpServerResponse.json({
    url: request.url,
    locale: yield* i18n.locale,
    link: yield* href("/lists"),
    data: yield* ViewData
  })
})

const handler = HttpApp.toWebHandler(i18n.plugin(echo))
const request = (path: string, init: RequestInit = {}) =>
  handler(new Request(`http://localhost${path}`, { redirect: "manual", ...init }))

describe("paraglide plugin", () => {
  it("redirects a path without a locale to the one the strategies pick", async () => {
    const response = await request("/lists?x=1", { headers: { cookie: "LOCALE=de" } })
    expect(response.status).toBe(302)
    expect(response.headers.get("location")).toBe("/de/lists?x=1")
    expect(response.headers.get("vary")).toBe("Cookie, Accept-Language")
  })

  it("answers anything but GET and HEAD without a locale with 404", async () => {
    expect((await request("/lists", { method: "POST" })).status).toBe(404)
  })

  it("strips the prefix, provides the locale to routes, links and views, and remembers it", async () => {
    const response = await request("/de/lists/1?x=1")
    expect(await response.json()).toEqual({ url: "/lists/1?x=1", locale: "de", link: "/de/lists", data: { locale: "de" } })
    expect(response.headers.get("set-cookie")).toContain("LOCALE=de")
  })

  it("has no locale outside the plugin", async () => {
    const exit = await Effect.runPromiseExit(i18n.locale)
    expect(exit._tag).toBe("Failure")
  })
})
