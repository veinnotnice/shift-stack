import { HttpApp, HttpRouter, HttpServerResponse } from "@effect/platform"
import { NodeHttpServer } from "@effect/platform-node"
import { Data, Effect, Layer } from "effect"
import { afterAll, describe, expect, it } from "vitest"
import {
  Assets,
  headFromManifest,
  href,
  clientAssets,
  errorPages,
  hxTrigger,
  Links,
  navigateTo,
  responders,
  Views,
  withViewData,
  type ServerPlugin
} from "@shift-stack/core/server"
import type { ViewModule } from "@shift-stack/core"

const frontend = { views: "src/views/index.ts", client: "src/client.ts", styles: "src/app.css" }

describe("hxTrigger", () => {
  it("escapes non-ASCII so the header survives Latin-1", () => {
    const header = hxTrigger({ toast: { message: "Ada gegrüßt" } })
    expect(header).toMatch(/^[\x20-\x7e]*$/)
    expect(JSON.parse(header)).toEqual({ toast: { message: "Ada gegrüßt" } })
  })
})

describe("headFromManifest", () => {
  it("links the stylesheet, preloads the font and loads the entry", () => {
    const head = headFromManifest(
      {
        "src/client.ts": { file: "assets/client-abc.js", css: ["assets/client-abc.css"] },
        "src/app.css": { file: "assets/app-def.css", assets: ["assets/font-123.woff2"] }
      },
      frontend
    )
    expect(head).toContain(`<link rel="preload" href="/assets/font-123.woff2" as="font" type="font/woff2" crossorigin>`)
    expect(head).toContain(`<link rel="stylesheet" href="/assets/app-def.css">`)
    expect(head).toContain(`<link rel="stylesheet" href="/assets/client-abc.css">`)
    expect(head).toContain(`<script type="module" src="/assets/client-abc.js"></script>`)
  })

  it("fails without the configured entries", () => {
    expect(() => headFromManifest({}, frontend)).toThrow(/src\/client\.ts/)
  })
})

// Views that say what they were asked to render, so the tests can see the context the server built.
// The not-found page stands alone, in a layout of its own.
const views: ViewModule<any, any> = {
  layoutOf: (name) => (name === "notFound" ? "bare" : "main"),
  renderDocument: (context, name, props) => `document:${name}:${JSON.stringify({ ...context, props })}`,
  renderPageContent: (context, name, props) => `page:${name}:${JSON.stringify({ ...context, props })}`,
  renderFragment: (context, name, props) => `fragment:${name}:${JSON.stringify({ ...context, props })}`
}

const { page, fragment } = responders<any, any>()

class Gone extends Data.TaggedError("Gone") {}

// A plugin in the shape of the locale one: rewrites nothing, adds view data and prefixes links.
const prefix: ServerPlugin = (app) =>
  app.pipe(
    withViewData({ locale: "de" }),
    Effect.provideService(Links, { href: (path) => `/de${path}` })
  )

const routes = HttpRouter.empty.pipe(
  HttpRouter.get("/", page("home", { title: "Home" })),
  HttpRouter.get("/row", Effect.map(fragment("row", { id: 1 }), (html) => HttpServerResponse.text(html))),
  HttpRouter.get("/gone", Effect.fail(new Gone())),
  HttpRouter.get("/broken", Effect.die("boom")),
  HttpRouter.get("/link", Effect.map(href("/lists"), (url) => HttpServerResponse.text(url))),
  HttpRouter.post("/go", navigateTo("/lists/1"))
)

const app = routes.pipe(
  errorPages({
    notFound: page("notFound", {}, 404),
    serverError: page("serverError", {}, 500),
    isNotFound: (error) => error instanceof Gone
  }),
  prefix,
  clientAssets(frontend)
)

const { handler, dispose } = HttpApp.toWebHandlerLayer(
  app,
  Layer.mergeAll(
    Layer.succeed(Views, { load: Effect.succeed(views) }),
    Layer.succeed(Assets, { head: "<script>assets</script>" }),
    NodeHttpServer.layerContext
  )
)
afterAll(dispose)

const request = (path: string, init: RequestInit = {}) => handler(new Request(`http://localhost${path}`, init))
const boosted = { "hx-request": "true", "hx-target": "htmx-content", "shift-layout": "main" }

describe("an app", () => {
  it("renders a whole document with the assets and the plugins' view data", async () => {
    const response = await request("/?q=1")
    const body = await response.text()
    expect(response.status).toBe(200)
    expect(response.headers.get("vary")).toBe("HX-Request, HX-Target, Shift-Layout")
    expect(body.startsWith("document:home:")).toBe(true)
    expect(JSON.parse(body.slice("document:home:".length))).toEqual({
      path: "/?q=1",
      data: { locale: "de" },
      assets: "<script>assets</script>",
      props: { title: "Home" }
    })
  })

  it("renders the page alone for a boosted navigation within the layout", async () => {
    const response = await request("/", { headers: boosted })
    expect((await response.text()).startsWith("page:home:")).toBe(true)
    expect(response.headers.get("shift-layout")).toBe("main")
    expect(response.headers.get("hx-retarget")).toBeNull()
  })

  it("swaps the whole body for a boosted navigation into another layout", async () => {
    for (const [path, from, to] of [["/nothing-here", "main", "bare"], ["/", "bare", "main"]] as const) {
      const response = await request(path, { headers: { ...boosted, "shift-layout": from } })
      expect((await response.text()).startsWith("document:")).toBe(true)
      expect(response.headers.get("hx-retarget")).toBe("body")
      expect(response.headers.get("hx-reswap")).toBe("innerHTML")
      expect(response.headers.get("shift-layout")).toBe(to)
    }
  })

  it("swaps the whole body when the browser did not say which layout it shows", async () => {
    const { "shift-layout": _, ...withoutLayout } = boosted
    const response = await request("/", { headers: withoutLayout })
    expect(response.headers.get("hx-retarget")).toBe("body")
  })

  it("renders the document for a history restore, even when boosted", async () => {
    const body = await (await request("/", { headers: { ...boosted, "hx-history-restore-request": "true" } })).text()
    expect(body.startsWith("document:home:")).toBe(true)
  })

  it("renders fragments in the same context", async () => {
    const body = await (await request("/row")).text()
    expect(JSON.parse(body.slice("fragment:row:".length))).toEqual({ path: "/row", data: { locale: "de" }, props: { id: 1 } })
  })

  it("answers unmatched routes and not-found errors with the not-found page, inside the plugins", async () => {
    for (const path of ["/nothing-here", "/gone"]) {
      const response = await request(path)
      expect(response.status).toBe(404)
      expect(await response.text()).toContain(`document:notFound:`)
    }
    expect(await (await request("/gone")).text()).toContain(`"locale":"de"`)
  })

  it("answers any other failure with the server error page", async () => {
    const response = await request("/broken")
    expect(response.status).toBe(500)
    expect(await response.text()).toContain("document:serverError:")
  })

  it("makes links and navigations through the plugins' Links", async () => {
    expect(await (await request("/link")).text()).toBe("/de/lists")
    const response = await request("/go", { method: "POST" })
    expect(response.status).toBe(204)
    expect(JSON.parse(response.headers.get("hx-location")!)).toEqual({ path: "/de/lists/1", target: "#htmx-content" })
  })

  it("does not serve files outside the built assets", async () => {
    expect((await request("/assets/..%2F..%2Fpackage.json")).status).toBe(404)
  })
})
