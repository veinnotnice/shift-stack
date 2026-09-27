// The contract between SHiFT's three halves: the server (Effect, in Node), the views (Svelte, rendered on the
// server inside Vite) and the client (HTMX and hydration, in the browser). They run in separate module graphs,
// so this file is all they share. It holds no state and imports only types.
import type { Component, ComponentProps } from "svelte"

/** The id of the element pages are swapped into. The layout renders it; boosted links and forms target it. */
export const contentTarget = "htmx-content"

/**
 * The layout the browser is showing. The client sends it with every request and takes it from every page response;
 * the server swaps only the page when it stays the same, and the whole body when the new page has another layout.
 */
export const layoutHeader = "Shift-Layout"

/** The client event that fetches the current page again, in place. The server sends it with `refresh`. */
export const refreshEvent = "refresh"

/** What the server tells the views about the request being rendered. */
export interface ViewContext {
  /** The request path and query as the routes see it, after plugins rewrote it (without a locale prefix, say). */
  readonly path: string
  /** What plugins and the app added with `withViewData`: the locale, the theme, … */
  readonly data: Readonly<Record<string, unknown>>
}

export interface DocumentContext extends ViewContext {
  /** Script, stylesheet and preload tags for the <head>. */
  readonly assets: string
}

export type Components = Record<string, Component<any>>

/** A page or fragment by name, with the props its component takes. */
export type Named<C extends Components> = { [K in keyof C & string]: { name: K; props: ComponentProps<C[K]> } }[keyof C & string]

/** What the views module (the default export of `createViews`) offers the server. */
export interface ViewModule<P extends Components = Components, F extends Components = Components> {
  /** The name of the layout a page renders in. */
  layoutOf(name: keyof P & string): string
  /** A whole HTML document: the page's layout with the page inside the content target. */
  renderDocument<K extends keyof P & string>(context: DocumentContext, name: K, props: ComponentProps<P[K]>): string
  /** The page alone, plus its layout's out-of-band parts, for a boosted navigation within the same layout. */
  renderPageContent<K extends keyof P & string>(context: ViewContext, name: K, props: ComponentProps<P[K]>): string
  /** A piece of a page that HTMX swaps on its own. */
  renderFragment<K extends keyof F & string>(context: ViewContext, name: K, props: ComponentProps<F[K]>): string
}

/** Islands as `import.meta.glob(…, { eager: true })` returns them. The file name is the island's name. */
export type IslandModules = Record<string, { default: Component<any> }>

export const islandsByName = (modules: IslandModules): ReadonlyMap<string, Component<any>> =>
  new Map(Object.entries(modules).map(([file, module]) => [file.split("/").pop()!.replace(/\.svelte$/, ""), module.default]))

/** Each island numbers its element ids from 1, so it gets its name as prefix: two islands sharing an id would make
 * HTMX move one element's attributes onto the other while it settles a swap. Server and client must agree on it. */
export const islandIdPrefix = (name: string) => `${name}-`

/**
 * Server HTML an island gets as a snippet (a slot). The placeholder carries each slot as
 * `<template data-island-slot="name">`, so the client can render it again whenever the island shows it anew (a sheet
 * that opens). The island receives it wrapped in one `slotElement`, which is laid out as if it weren't there.
 */
export const islandSlotAttribute = "data-island-slot"
export const slotElement = "shift-slot"
export const wrapSlot = (html: string) => `<${slotElement} style="display:contents">${html}</${slotElement}>`

/** Where the app's frontend lives, relative to the Vite root. The Vite plugin and the server both read it. */
export interface FrontendConfig {
  /** The module that default-exports `createViews(…)`. */
  readonly views: string
  /** The browser entry, which calls `start(…)`. */
  readonly client: string
  /** The stylesheet. */
  readonly styles: string
  /** Where `vite build` puts the browser files. Default "dist/client". */
  readonly outDir?: string
}

export const clientOutDir = (config: FrontendConfig): string => config.outDir ?? "dist/client"
