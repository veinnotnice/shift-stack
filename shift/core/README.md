# SHiFT

**S**velte + **H**ypermedia + **i**slands + e**F**fect + **T**ypeScript.

Pages are Svelte components rendered on the server by an [Effect](https://effect.website) HTTP app. [HTMX](https://htmx.org)
swaps them in without full reloads. The interactive parts are Svelte islands: rendered on the server with the page,
then hydrated in place in the browser, so they show from the first paint and work before any JavaScript arrives.

```
npm install @shift-stack/core effect @effect/platform @effect/platform-node svelte vite
```

## Four entry points

The code runs in three places that don't share modules, plus the build:

| Import                          | Runs                                       | What it gives you                                           |
| ------------------------------- | ------------------------------------------ | ----------------------------------------------------------- |
| `@shift-stack/core/server`     | Node (Effect)                              | responses for pages and fragments, HTMX headers, error pages, `serve` |
| `@shift-stack/core/views`      | inside Vite, on the server                 | `createViews`, `Island`                                     |
| `@shift-stack/core/client`     | the browser                                | `start`: HTMX and island hydration                          |
| `@shift-stack/core/vite`       | `vite.config.ts`                           | the `shift` plugin                                          |

`@shift-stack/core` itself holds the constants all four agree on (`contentTarget`, …). It has no side effects, so
islands can import it. `@shift-stack/core/attributes` is types only: import it once from a `.d.ts` of the app, and
views may use `hx-*` attributes on any element.

## Setting up an app

**1. Say where the frontend lives.** One object, shared by Vite and the server:

```ts
// src/frontend/config.ts
export const frontend = {
  views: "src/frontend/views/index.ts",
  client: "src/frontend/islands/entry.ts",
  styles: "src/frontend/styles/app.css"
}
```

```ts
// vite.config.ts
import { svelte } from "@sveltejs/vite-plugin-svelte"
import { shift } from "@shift-stack/core/vite"
import { frontend } from "./src/frontend/config.ts"

export default { plugins: [svelte(), shift(frontend)] }
```

**2. The views.** The pages, the layouts they render in (each with an element of id `contentTarget`), and the islands:

```ts
// src/frontend/views/index.ts
import { createViews } from "@shift-stack/core/views"
import Home from "./pages/Home.svelte"
import NotFound from "./pages/NotFound.svelte"
import Row from "./components/Row.svelte"
import Layout from "./Layout.svelte"
import TopBar from "./TopBar.svelte"

const pages = { home: Home, notFound: NotFound }
const fragments = { row: Row }
export type Pages = typeof pages
export type Fragments = typeof fragments

export default createViews({
  pages,
  fragments,
  islands: import.meta.glob("../islands/*.svelte", { eager: true }),
  layouts: {
    main: {
      component: Layout,                     // gets the props below, plus `page` and `pageProps`
      props: (page, context) => ({ title: page.name }),
      outOfBand: [TopBar]                    // sent along with every page swap, with `oob: true`
    },
    bare: { component: Bare }                // no bars: just the content target and the page
  },
  defaultLayout: "main",
  pageLayouts: { notFound: "bare" }
})
```

```svelte
<!-- Layout.svelte -->
<script lang="ts">
  import { contentTarget, Island } from "@shift-stack/core/views"
  let { title, page: Page, pageProps } = $props()
</script>

<TopBar {title} />
<main id={contentTarget}><Page {...pageProps} /></main>
<Island name="Toaster" props={{ position: "top" }} />
```

**3. The browser entry.**

```ts
// src/frontend/islands/entry.ts
import { start } from "@shift-stack/core/client"

start({ islands: import.meta.glob("./*.svelte", { eager: true }) })
```

**4. The server.** Routes are a plain `HttpRouter`; SHiFT wraps it, from the inside out:

```ts
import { HttpRouter } from "@effect/platform"
import { clientAssets, errorPages, responders } from "@shift-stack/core/server"
import type { Fragments, Pages } from "../frontend/views/index.ts"
import { frontend } from "../frontend/config.ts"

const { page, fragment } = responders<Pages, Fragments>()

const routes = HttpRouter.empty.pipe(HttpRouter.get("/", page("home", { greeting: "Hi" })))

export const app = routes.pipe(
  errorPages({ notFound: page("notFound", {}, 404), serverError: page("notFound", {}, 500) }),
  clientAssets(frontend)
)
```

```ts
// dev.ts: Vite serves the browser code and reloads the views on every request
import { serve } from "@shift-stack/core/server"
import { frontendDev } from "@shift-stack/core/server/dev"
serve(app, frontendDev(frontend))

// prod.ts: after `vite build && vite build --ssr prod.ts --outDir dist/server`
import { Layer } from "effect"
import { assetsFromManifest, serve, viewsBundled } from "@shift-stack/core/server"
serve(app, Layer.merge(viewsBundled(() => import("../frontend/views/index.ts")), assetsFromManifest(frontend)))
```

`page` answers a boosted navigation with the page alone, plus the layout's out-of-band parts. Anything else (a
first load, a reload, a history restore) gets the whole document. `fragment` renders a piece HTMX swaps on its own.

## Layouts

Pages can render in different layouts, for example an error page without the app's bars. The browser tells the
server which layout it shows (the `Shift-Layout` header, from `<body data-layout>`). A navigation within one layout
swaps only the page. A navigation into another layout gets the whole document, and the client swaps it in for the
whole body (`HX-Retarget: body`), so the bars leave and come back as they should. The islands in the old body are
unmounted and the new ones hydrated. Every layout must render the content target, which links keep aiming at.

## Responding to HTMX

- `htmlResponse(html, status?)`: HTML that varies on the HTMX headers.
- `trigger({ event: data })`: raise events in the browser (`response.pipe(trigger({ toast }))`).
- `navigateTo(path)`: navigate like a boosted link would.
- `refresh`: fetch the current page again, in place.
- `href(path)`: a link as the current request should see it (a plugin may add a locale prefix).

## Plugins

Server code and views run in different module graphs (in development the views run inside Vite), so a plugin
comes in two halves:

- **`ServerPlugin`**: a middleware, `(app) => app`, piped in after `errorPages` so the error pages get what it
  provides. It can answer on its own, rewrite the request, set cookies, add view data (`withViewData`) and change
  links (`Links`).
- **`ViewPlugin`**: `{ around, htmlAttributes, head }`. `around` wraps every render for per-request state, and the
  other two add to the document. It reads what the server half put into `context.data`.

[`@shift-stack/paraglide`](../paraglide) is one: localized URLs with [Paraglide JS](https://inlang.com/m/gerre34r/library-inlang-paraglideJs).

## Islands

An island is a Svelte component in the app's islands folder; SHiFT ships none. Place one with
`<Island name="File" props={…} />`. The props travel as JSON, so they must be JSON-safe. Islands render on the server
too, so nothing may touch `document` or HTMX at import time.

**An island is not a small app.** It owns what happens in the browser while the user is doing it (a sheet sliding
open, a drag, a gesture, a filter while typing). What the island shows and what it sends are the server's HTML: its
slots. Props are only for how it behaves, not for the application's data.

### Slots

Snippets passed to `<Island>` are its slots, the children and any named ones:

```svelte
<!-- A view (rendered on the server) -->
<Island name="Sheet" props={{ title: "New List" }}>
  {#snippet trigger()}<Plus />New List{/snippet}
  <form hx-post="/lists" hx-target="this" hx-swap="outerHTML">…</form>
</Island>
```

```svelte
<!-- islands/Sheet.svelte: places the slots, knows nothing of what is in them -->
<script lang="ts">
  let { title, trigger, children } = $props()
</script>
<Drawer.Root><Drawer.Trigger>{@render trigger()}</Drawer.Trigger><Drawer.Content>{@render children()}</Drawer.Content></Drawer.Root>
```

- The island gets each slot as a snippet that renders the server's HTML, wrapped in one `<shift-slot>` laid out as
  if it weren't there. It can put the slot anywhere, show it later or several times (a sheet renders it each time it
  opens).
- **Svelte owns the island, HTMX owns inside its slots.** Whenever a slot is put into the page, HTMX processes it and
  the islands inside it are mounted; when the island takes it out, those are unmounted. Target elements inside the
  slot, never the `<shift-slot>` itself.
- The client keeps each slot as a `<template>` in the placeholder. What HTMX swaps into a slot is copied back into
  it, so the server's answer (a saved setting, a form with its errors) is what the slot shows the next time.
- To send something, an island doesn't build requests: the slot holds a form, and the island fills in a field and
  calls `form.requestSubmit()`.

### Lifecycle

`start` hydrates every island HTMX loads, and unmounts it exactly once: when HTMX removes it, or when the slot it
sits in is taken out.

One page at a time: a new request for a page (a link, back, a form that navigates, `refresh`) cancels the page
request still on its way, so a slow answer never lands on top of a newer page. Requests that swap a piece of the page
are left alone.

## Tests in a browser

`shift/e2e` is a small app built on SHiFT, served as in production on port 4310, with Playwright tests of what only
a browser shows: hydration, navigation and back, crossing layouts, slots and the islands in them, swaps, overlapping
requests. Every island there records when it mounts and unmounts, so a test sees a leak as one island too many.
`pnpm e2e` from the root.
