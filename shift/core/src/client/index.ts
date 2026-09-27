// The client half of SHiFT: starts HTMX and brings the server-rendered Svelte islands to life.
import htmx from "htmx.org"
import { createRawSnippet, hydrate, mount, unmount } from "svelte"
import {
  contentTarget,
  islandIdPrefix,
  islandSlotAttribute,
  islandsByName,
  layoutHeader,
  refreshEvent,
  wrapSlot,
  type IslandModules
} from "#protocol"

export interface ClientOptions {
  /** `import.meta.glob("./*.svelte", { eager: true })` in the islands folder. */
  readonly islands: IslandModules
}

export const start = (options: ClientOptions): void => {
  // Swap 422 responses too: they carry the form with its validation errors.
  htmx.config.responseHandling = [
    { code: "204", swap: false },
    { code: "[23]..", swap: true },
    { code: "422", swap: true },
    { code: "[45]..", swap: false, error: true }
  ]

  // Pages land in the content target, or in the whole body when they come with another layout (the server
  // retargets those).
  const isPageTarget = (target: Element) => target.id === contentTarget || target === document.body

  // The server needs to know which layout is showing, to send only the page or the whole body.
  document.addEventListener("htmx:configRequest", (event) => {
    const { headers } = (event as CustomEvent<{ headers: Record<string, string> }>).detail
    headers[layoutHeader] = document.body.dataset.layout ?? ""
  })

  document.addEventListener("htmx:beforeSwap", (event) => {
    const detail = (event as CustomEvent<{ target: Element; xhr: XMLHttpRequest; shouldSwap: boolean; isError: boolean }>).detail
    // A 404 or 500 page answering a navigation replaces the page like any other. Errors answering a fragment
    // request (a form) stay unswapped, so they can't replace the form with a whole page.
    if (isPageTarget(detail.target) && detail.xhr.status >= 400) {
      Object.assign(detail, { shouldSwap: true, isError: false })
    }
    // Swapping the body's content keeps the <body> element, so its layout is updated here.
    const layout = detail.xhr.getResponseHeader(layoutHeader)
    if (detail.shouldSwap && layout) document.body.dataset.layout = layout
  })

  // One page at a time: a new request for a page cancels the one still on its way, so what the user asked for last is
  // what they see, and a slow answer can't land on top of a newer page. Requests that swap a piece of the page (a form
  // answering in place) are left alone.
  let pageRequest: XMLHttpRequest | null = null
  document.addEventListener("htmx:beforeRequest", (event) => {
    const { target, xhr } = (event as CustomEvent<{ target: Element; xhr: XMLHttpRequest }>).detail
    if (!isPageTarget(target)) return
    pageRequest?.abort()
    pageRequest = xhr
    xhr.addEventListener("loadend", () => {
      if (pageRequest === xhr) pageRequest = null
    })
  })

  // A new page starts at the very top. HTMX would instead scroll the content target's top edge into view, which
  // may sit below a bar. Swaps that are not a page change keep the scroll position.
  htmx.config.scrollIntoViewOnBoost = false
  document.body.addEventListener("htmx:afterSwap", (event) => {
    const { boosted, target } = (event as CustomEvent<{ boosted: boolean; target: Element }>).detail
    if (boosted && isPageTarget(target)) window.scrollTo({ top: 0 })
  })

  // Fetch the current page again, in place (the server's `refresh`).
  document.body.addEventListener(refreshEvent, () => {
    void htmx.ajax("get", location.pathname + location.search, { target: `#${contentTarget}`, swap: "innerHTML" })
  })

  // No history snapshots: a snapshot would hold mounted islands' DOM and stale server data. Back refetches the page.
  htmx.config.historyCacheSize = 0

  const islands = islandsByName(options.islands)
  // null while the island is still hydrating: the islands in its slots come to life during that.
  const mounted = new Map<Element, ReturnType<typeof hydrate> | null>()

  const placeholdersIn = (root: Element) => (root.matches("[data-island]") ? [root] : [...root.querySelectorAll("[data-island]")])

  // A slot is server HTML the island shows where it wants. Whenever Svelte puts it into the page (hydrating it in place,
  // or rendering it anew from its template when a sheet opens), HTMX learns its links and forms and the islands inside
  // it come to life; when Svelte takes it out again, those islands are unmounted.
  // What the server swapped into a slot stays: the template takes it over, so the slot shows it when rendered anew
  // (a setting the server confirmed, a form it answered with errors). Typing alone changes nothing on the server, and
  // so nothing in the template.
  const slotSnippet = (template: HTMLTemplateElement) =>
    createRawSnippet(() => ({
      render: () => wrapSlot(template.innerHTML),
      setup: (element: Element) => {
        htmx.process(element)
        mountIslands(element)
        const keep = () => (template.innerHTML = element.innerHTML)
        element.addEventListener("htmx:afterSettle", keep)
        return () => {
          element.removeEventListener("htmx:afterSettle", keep)
          unmountIslands(element)
        }
      }
    }))

  const slotsOf = (target: HTMLElement) =>
    Object.fromEntries(
      [...target.querySelectorAll<HTMLTemplateElement>(`:scope > template[${islandSlotAttribute}]`)].map((template) => [
        template.getAttribute(islandSlotAttribute)!,
        slotSnippet(template)
      ])
    )

  const mountIslands = (root: Element) => {
    for (const target of placeholdersIn(root)) {
      if (!(target instanceof HTMLElement) || mounted.has(target)) continue
      const name = target.dataset.island ?? ""
      const island = islands.get(name)
      if (!island) {
        console.error(`No island named ${name}`)
        continue
      }
      // The server rendered the island inside its placeholder, after its slot templates: hydrate that markup in place
      // (hydration skips the templates). Mount only if the server rendered nothing.
      const props = { ...JSON.parse(target.dataset.props ?? "{}"), ...slotsOf(target) }
      const options = { target, props, idPrefix: islandIdPrefix(name) }
      const rendered = [...target.childNodes].some((node) => !(node instanceof HTMLTemplateElement))
      mounted.set(target, null)
      mounted.set(target, rendered ? hydrate(island, options) : mount(island, options))
    }
  }

  // Each island exactly once: whoever gets to it first (HTMX cleaning up, or its parent island taking the slot it sits
  // in away) takes it out of `mounted`.
  const unmountIslands = (root: Element) => {
    for (const target of placeholdersIn(root)) {
      const instance = mounted.get(target)
      mounted.delete(target)
      if (instance) void unmount(instance)
    }
  }

  // htmx:load fires for the body on start and for every piece of swapped-in content after that.
  document.addEventListener("htmx:load", (event) => mountIslands(event.target as Element))

  // HTMX fires this for every node it removes, text nodes too: unmount the island an element holds.
  document.addEventListener("htmx:beforeCleanupElement", (event) => {
    const target = event.target
    if (target instanceof Element && target.matches("[data-island]")) unmountIslands(target)
  })
}
