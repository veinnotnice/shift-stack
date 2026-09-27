// The views half of SHiFT: renders the app's Svelte pages on the server. It runs inside Vite (ssrLoadModule in
// development, the server bundle in production), so per-request state such as the locale is set up here, by plugins.
import { createRawSnippet, type Component } from "svelte"
import { render } from "svelte/server"
import {
  contentTarget,
  islandIdPrefix,
  islandSlotAttribute,
  islandsByName,
  wrapSlot,
  type Components,
  type DocumentContext,
  type IslandModules,
  type Named,
  type ViewContext,
  type ViewModule
} from "#protocol"

export { default as Island } from "./Island.svelte"
export type { DocumentContext, IslandModules, Named, ViewContext, ViewModule } from "#protocol"
export { contentTarget } from "#protocol"

/** The views half of a plugin. */
export interface ViewPlugin {
  /** Runs every render inside it: the place for per-request state that components read (the locale). */
  readonly around?: <A>(context: ViewContext, render: () => A) => A
  /** Attributes for <html>, such as lang and dir. */
  readonly htmlAttributes?: (context: ViewContext) => Readonly<Record<string, string>>
  /** Tags for the <head>. */
  readonly head?: (context: ViewContext) => string
}

export interface Layout<P extends Components> {
  /** The document's body around the page. Gets the layout props plus `page` (the component) and `pageProps`. It
   * must render the element with id `contentTarget` and the page inside it: links and forms keep targeting it. */
  readonly component: Component<any>
  /** Props for the layout, worked out per page (a title, the active tab), inside the plugins' `around`. */
  readonly props?: (page: Named<P>, context: ViewContext) => Record<string, unknown>
  /** Parts of the layout that change with the page (bars). They are sent along with a boosted navigation, and are
   * rendered with the layout props and `oob: true`, which they turn into `hx-swap-oob`. */
  readonly outOfBand?: ReadonlyArray<Component<any>>
}

export interface ViewsOptions<P extends Components, F extends Components, N extends string> {
  readonly pages: P
  /** Pieces of a page that HTMX swaps on their own. */
  readonly fragments?: F
  /** `import.meta.glob("../islands/*.svelte", { eager: true })`: every island, rendered into its placeholder. */
  readonly islands: IslandModules
  /** The layouts pages render in, by name. Navigating between pages of one layout swaps only the page; to a page of
   * another layout, the whole body. */
  readonly layouts: Record<N, Layout<P>>
  /** The layout of every page `pageLayouts` doesn't name. */
  readonly defaultLayout: NoInfer<N>
  /** Pages that render in another layout than the default: `{ serverError: "bare" }`. */
  readonly pageLayouts?: { readonly [K in keyof P & string]?: NoInfer<N> }
  /** Tags for the <head> of every document, after <meta charset>. */
  readonly head?: string
  /** Outermost first. */
  readonly plugins?: ReadonlyArray<ViewPlugin>
}

const escapeAttribute = (value: string) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;")
const attributeText = (value: string) =>
  value.replaceAll("&quot;", '"').replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&#39;", "'").replaceAll("&amp;", "&")

// Islands are rendered on the server too, into their placeholders, so they are on the page from the first paint and
// the browser hydrates them in place: no empty box, no jump, and usable before any JavaScript runs.
// Island.svelte leaves a placeholder whose end, and each slot's start and end, carry the island's key, so a lazy match
// stops at this island's end and not at a nested one's. Svelte's hydration comments may sit between the markers.
const placeholder =
  /<div data-island="(\w+)" data-props="([^"]*)" data-island-key="(\d+)"([^>]*)>([\s\S]*?)<shift-island-close data-key="\3"><\/shift-island-close>(?:\s|<!--.*?-->)*<\/div>/g
const slotsOf = (key: string, inner: string): Array<[name: string, html: string]> =>
  [...inner.matchAll(new RegExp(`<shift-slot-open data-key="${key}" data-name="(\\w+)"></shift-slot-open>([\\s\\S]*?)<shift-slot-close data-key="${key}"></shift-slot-close>`, "g"))].map(
    ([, name, html]) => [name!, html!]
  )

/** Creates the views module. Export the result as the module's default; the server loads it from there. */
export const createViews = <P extends Components, F extends Components = {}, N extends string = string>(
  options: ViewsOptions<P, F, N>
): ViewModule<P, F> => {
  const plugins = options.plugins ?? []
  const islands = islandsByName(options.islands)
  const fragments = (options.fragments ?? {}) as F

  // Each slot's HTML goes to the island as a snippet, and along in a <template> for the client. Islands nested in a
  // slot are rendered first, so the slot carries them rendered too.
  const withIslands = (html: string): string =>
    html.replace(placeholder, (whole, name: string, props: string, key: string, rest: string, inner: string) => {
      const island = islands.get(name)
      if (!island) return whole
      const slots = slotsOf(key, inner).map(([slot, content]) => [slot, withIslands(content)] as const)
      const snippets = Object.fromEntries(slots.map(([slot, content]) => [slot, createRawSnippet(() => ({ render: () => wrapSlot(content) }))]))
      const { body } = render(island, { props: { ...JSON.parse(attributeText(props)), ...snippets }, idPrefix: islandIdPrefix(name) })
      const templates = slots.map(([slot, content]) => `<template ${islandSlotAttribute}="${slot}">${content}</template>`).join("")
      return `<div data-island="${name}" data-props="${props}"${rest}>${templates}${body}</div>`
    })

  const within = <A>(context: ViewContext, f: () => A): A =>
    plugins.reduceRight<() => A>((inner, plugin) => (plugin.around ? () => plugin.around!(context, inner) : inner), f)()

  const htmlAttributes = (context: ViewContext): string =>
    plugins
      .flatMap((plugin) => Object.entries(plugin.htmlAttributes?.(context) ?? {}))
      .map(([name, value]) => ` ${name}="${escapeAttribute(value)}"`)
      .join("")

  const layoutOf = (name: keyof P & string): N => options.pageLayouts?.[name] ?? options.defaultLayout
  const layoutProps = (name: keyof P & string, props: unknown, context: ViewContext): Record<string, unknown> =>
    options.layouts[layoutOf(name)].props?.({ name, props } as Named<P>, context) ?? {}

  return {
    layoutOf,

    renderDocument: (context: DocumentContext, name, props) =>
      within(context, () => {
        const layout = layoutOf(name)
        const layoutInput: Record<string, unknown> = { ...layoutProps(name, props, context), page: options.pages[name], pageProps: props }
        const { head, body } = render(options.layouts[layout].component, { props: layoutInput })
        const pluginHead = plugins.map((plugin) => plugin.head?.(context) ?? "").filter(Boolean)
        return `<!doctype html>
<html${htmlAttributes(context)}>
<head>
<meta charset="utf-8">
${[options.head ?? "", ...pluginHead, context.assets, head].filter(Boolean).join("\n")}
</head>
<body hx-boost="true" hx-target="#${contentTarget}" data-layout="${escapeAttribute(layout)}">${withIslands(body)}</body>
</html>`
      }),

    // The <title> comes first so HTMX updates the tab; the layout's changing parts follow out of band.
    renderPageContent: (context, name, props) =>
      within(context, () => {
        const { head, body } = render(options.pages[name] as Component<any>, { props })
        const bars = options.layouts[layoutOf(name)].outOfBand ?? []
        const shared = layoutProps(name, props, context)
        const outOfBand = bars.map((bar) => render(bar, { props: { ...shared, oob: true } }).body).join("")
        return head + withIslands(body + outOfBand)
      }),

    renderFragment: (context, name, props) =>
      within(context, () => withIslands(render(fragments[name] as Component<any>, { props }).body))
  }
}
