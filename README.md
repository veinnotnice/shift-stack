# SHiFT

**S**velte + **H**ypermedia + **i**slands + e**F**fect + **T**ypeScript.

Server-rendered Svelte on an [Effect](https://effect.website) HTTP server, swapped by [HTMX](https://htmx.org), with
Svelte islands for the parts that must react in the browser.

- **The server owns the state.** Pages and fragments are Svelte components rendered on the server. A link or a form
  asks the server, and the server answers with HTML. No client-side store, no API layer, no JSON in between.
- **Islands own only the interaction.** A sheet sliding up, a filter while typing, a drag. What an island shows is
  server HTML, passed in as slots; HTMX runs inside them. Islands render on the server with the page, so they are
  there from the first paint and hydrate in place.
- **Typed end to end.** Routes are Effect programs, pages and fragments are typed by their Svelte props, and errors are
  values until the edge.

> [!NOTE]
> SHiFT is young: `0.x`, and the API may still change between minor versions.

## What it looks like

A route answers with a page or a fragment, typed by the component's props:

```ts
const routes = HttpRouter.empty.pipe(
  HttpRouter.get("/", Effect.suspend(() => page("home", { clicks }))),
  HttpRouter.post("/clicks", Effect.suspend(() => fragment("clicks", { count: ++clicks })).pipe(Effect.map(htmlResponse)))
)
```

The fragment is a plain Svelte component with an HTMX form. The server keeps the count:

```svelte
<form hx-post="/clicks" hx-target="this" hx-swap="outerHTML">
  <button>Clicked {count} times</button>
</form>
```

An island wraps server HTML and adds only what happens in the browser, here opening a dialog:

```svelte
<Island name="Dialog">
  {#snippet trigger()}Say hello{/snippet}
  <GreetForm />   <!-- server HTML: HTMX posts it, the server answers in place -->
</Island>
```

That is the whole of [`apps/minimal`](apps/minimal), the starter.

## Packages

| Package                                        | What it is                                                                 |
| ---------------------------------------------- | -------------------------------------------------------------------------- |
| [`@shift-stack/core`](shift/core)              | The stack: server responses, views, islands, the client, the Vite plugin.  |
| [`@shift-stack/paraglide`](shift/paraglide)    | Localization with Paraglide JS: locale-prefixed URLs, the locale in views. |

```
npm install @shift-stack/core effect @effect/platform @effect/platform-node svelte vite
```

The [core README](shift/core) walks through setting up an app step by step.

## Apps

| App                          | What it shows                                                                                   |
| ---------------------------- | ----------------------------------------------------------------------------------------------- |
| [`apps/minimal`](apps/minimal) | The starter: SHiFT and Tailwind, nothing else. Two pages, two forms, one island. Copy it.      |
| [`apps/web`](apps/web)       | Todos, a demo app built to feel like an iOS app: lists, a calendar, sheets, a sidebar, two languages. |

## Try it

Node 24 and pnpm 10:

```
git clone https://github.com/veinnotnice/shift-stack.git
cd shift-stack
pnpm install
pnpm dev:minimal     # the starter on http://localhost:3001
pnpm dev             # the Todos demo on http://localhost:3000
```

## Repository

```
shift/        the open-source packages, and e2e/: a fixture app with Playwright tests of SHiFT in a browser
apps/         apps built on SHiFT: minimal (the starter) and web (Todos)
packages/     Todos' own libraries: domain, data, services, in-memory storage, its design system
```

`pnpm check` · `pnpm test` · `pnpm e2e`, from the root. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
