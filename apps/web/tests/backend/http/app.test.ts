import { HttpApp } from "@effect/platform"
import { NodeHttpServer } from "@effect/platform-node"
import { Layer } from "effect"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { app } from "#backend/http/app.ts"
import { AppServices } from "#backend/main/serve.ts"
import { assetsNone, viewsBundled } from "@shift-stack/core/server"

const { handler, dispose } = HttpApp.toWebHandlerLayer(app, Layer.mergeAll(viewsBundled(() => import("#frontend/views/index.ts")), assetsNone, AppServices, NodeHttpServer.layerContext))
afterAll(dispose)

const get = (path: string, headers: Record<string, string> = {}) =>
  handler(new Request(`http://localhost${path}`, { headers, redirect: "manual" }))

// The first full page also loads the islands' libraries for server rendering (bits-ui, vaul, sonner), which
// Vitest transforms on first use. Pay that once here, not inside whichever test happens to run first.
beforeAll(() => get("/en/"), 60_000)

// The settings sheet (server HTML in the Sheet island's slot) links each language to the current page.
const languageLinks = (html: string): Record<string, string> =>
  Object.fromEntries([...html.matchAll(/<a href="([^"]*)"[^>]*hreflang="(\w+)"/g)].map(([, href, locale]) => [locale, href]))

describe("locale prefix", () => {
  it("redirects an unprefixed path using Accept-Language", async () => {
    const response = await get("/?x=1", { "accept-language": "de-DE,de;q=0.9" })
    expect(response.status).toBe(302)
    expect(response.headers.get("location")).toBe("/de/?x=1")
  })

  it("redirects / to the base locale", async () => {
    const response = await get("/")
    expect(response.headers.get("location")).toBe("/en/")
  })

  it("prefers the remembered locale over Accept-Language", async () => {
    const response = await get("/", { cookie: "PARAGLIDE_LOCALE=de", "accept-language": "en" })
    expect(response.headers.get("location")).toBe("/de/")
  })

  it("does not redirect an unprefixed POST", async () => {
    const response = await handler(new Request("http://localhost/anything", { method: "POST" }))
    expect(response.status).toBe(404)
  })

  it("renders the document in the prefixed locale and remembers it", async () => {
    const response = await get("/de/")
    const html = await response.text()
    expect(response.status).toBe(200)
    expect(html).toContain(`<html lang="de" dir="ltr" data-theme="system">`)
    expect(html).toContain(`<h1 class="large-title text-large-title">Heute</h1>`)
    expect(languageLinks(html)).toEqual({ en: "/en/", de: "/de/" })
    expect(response.headers.get("set-cookie")).toContain("PARAGLIDE_LOCALE=de")
  })

  it("renders the chosen theme", async () => {
    const html = await (await get("/en/", { cookie: "theme=dark" })).text()
    expect(html).toContain(`data-theme="dark"`)
  })
})

describe("HTMX navigation", () => {
  it("sends only the page, plus both bars out of band, for a boosted swap", async () => {
    const html = await (await get("/en/", { "hx-request": "true", "hx-target": "htmx-content", "shift-layout": "app" })).text()
    expect(html).not.toContain("<html")
    expect(html).toContain("<title>Today · Todos</title>")
    expect(html).toContain(`id="top-bar" hx-swap-oob="true"`)
    expect(html).toContain(`id="tab-bar" hx-swap-oob="true"`)
    expect(html).toContain(`href="/en/" aria-current="page"`)
  })

  it("sends the whole document when HTMX restores history", async () => {
    const html = await (
      await get("/en/", { "hx-request": "true", "hx-target": "htmx-content", "shift-layout": "app", "hx-history-restore-request": "true" })
    ).text()
    expect(html).toContain("<html")
  })
})

describe("errors", () => {
  it("renders the translated 404 page", async () => {
    const response = await get("/de/nowhere")
    expect(response.status).toBe(404)
    expect(await response.text()).toContain("Seite nicht gefunden")
  })

  it("shows the error page without the bars, with a way back", async () => {
    const html = await (await get("/en/nowhere")).text()
    expect(html).toContain(`data-layout="bare"`)
    expect(html).not.toContain(`id="top-bar"`)
    expect(html).not.toContain(`id="tab-bar"`)
    expect(html).toContain(`href="/en/"`)
  })

  it("replaces the whole body when a navigation leads from the app to the error page", async () => {
    const response = await get("/en/nowhere", { "hx-request": "true", "hx-target": "htmx-content", "shift-layout": "app" })
    expect(response.status).toBe(404)
    expect(response.headers.get("hx-retarget")).toBe("body")
    expect(response.headers.get("shift-layout")).toBe("bare")
  })

  it("brings the bars back on the way from the error page into the app", async () => {
    const response = await get("/en/", { "hx-request": "true", "hx-target": "htmx-content", "shift-layout": "bare" })
    const html = await response.text()
    expect(response.headers.get("hx-retarget")).toBe("body")
    expect(html).toContain(`data-layout="app"`)
    expect(html).toContain(`id="tab-bar"`)
  })
})

const post = (path: string, body: Record<string, string> = {}) =>
  handler(
    new Request(`http://localhost${path}`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", "hx-request": "true" },
      body: new URLSearchParams(body)
    })
  )

describe("lists and tasks", () => {
  it("shows the smart lists and the user's lists", async () => {
    const html = await (await get("/en/lists")).text()
    expect(html).toContain("My Lists")
    expect(html).toContain("Einkaufen")
    expect(html).toContain('href="/en/smart/flagged"')
  })

  it("adds a task from the inline row and answers with its row", async () => {
    const response = await post("/en/lists/groceries/tasks", { title: "  Oat milk  " })
    const html = await response.text()
    expect(response.status).toBe(200)
    expect(html).toContain("Oat milk")
    expect(html).toContain('id="task-')
  })

  it("ignores an empty title", async () => {
    expect((await post("/en/lists/groceries/tasks", { title: "   " })).status).toBe(204)
  })

  it("completes a task with an undo toast, and undoes it", async () => {
    const completed = await post("/de/tasks/seed-0/complete?in=smart")
    expect(await completed.text()).not.toContain('id="task-seed-0"')
    const trigger = JSON.parse(completed.headers.get("hx-trigger")!)
    expect(trigger.toast.message).toBe("„Zahnarzttermin vereinbaren“ erledigt")
    expect(trigger.toast.action).toEqual({ label: "Rückgängig", url: "/de/tasks/seed-0/undo" })

    const undone = await post(trigger.toast.action.url)
    expect(undone.status).toBe(204)
    expect(JSON.parse(undone.headers.get("hx-trigger")!)).toEqual({ refresh: true })
    expect(await (await get("/de/")).text()).toContain("Zahnarzttermin vereinbaren")
  })

  it("carries the New List form in the sheet island, as server HTML", async () => {
    const html = await (await get("/en/lists")).text()
    expect(html).toContain('<div data-island="Sheet"')
    expect(html).toMatch(/<template data-island-slot="children">[\s\S]*<form id="new-list" data-sheet-close="" hx-post="\/en\/lists"/)
  })

  it("creates a list and takes the app there", async () => {
    const response = await post("/en/lists", { name: "  Garden  ", color: "green", icon: "house" })
    expect(response.status).toBe(204)
    const { path } = JSON.parse(response.headers.get("hx-location")!)
    expect(path).toMatch(/^\/en\/lists\//)
    expect(await (await get(path)).text()).toContain("Garden")
  })

  it("sends the New List form back with its error when the name is blank, keeping what was chosen", async () => {
    const response = await post("/en/lists", { name: "   ", color: "purple", icon: "star" })
    const html = await response.text()
    expect(response.status).toBe(422)
    expect(html).toContain('<form id="new-list"')
    expect(html).toContain("Give the list a name of up to 60 characters.")
    expect(html).toMatch(/<input[^>]*value="purple"[^>]*checked/)
    expect(html).toMatch(/<input[^>]*value="star"[^>]*checked/)
  })

  it("answers an unknown list with the 404 page", async () => {
    expect((await get("/en/lists/nope")).status).toBe(404)
  })
})

describe("calendar", () => {
  it("shows the chosen day's tasks and marks the days that have tasks", async () => {
    const response = await get("/en/calendar?day=2099-01-01")
    expect(response.status).toBe(200)
    expect(await response.text()).toContain('data-island="MonthCalendar"')
  })

  it("falls back to today for a malformed day, and pushes the day into the address bar for HTMX", async () => {
    expect((await get("/en/calendar?day=nonsense")).status).toBe(200)
    const swap = await get("/de/calendar?day=2026-10-01", { "hx-request": "true", "hx-target": "htmx-content", "shift-layout": "app" })
    expect(swap.headers.get("hx-push-url")).toBe("/de/calendar?day=2026-10-01")
  })
})

describe("settings", () => {
  it("keeps the chosen theme, answers with the form as it now stands, and tells the page to apply it", async () => {
    const response = await post("/en/settings/theme", { theme: "dark" })
    expect(response.status).toBe(200)
    expect(response.headers.get("set-cookie")).toMatch(/^theme=dark;.*Path=\//)
    expect(JSON.parse(response.headers.get("hx-trigger")!)).toEqual({ theme: { theme: "dark" } })
    expect(await response.text()).toMatch(/<input[^>]*value="dark"[^>]*checked/)
  })

  it("falls back to automatic for an unknown theme", async () => {
    const response = await post("/en/settings/theme", { theme: "sepia" })
    expect(response.headers.get("set-cookie")).toMatch(/^theme=system;/)
  })
})
