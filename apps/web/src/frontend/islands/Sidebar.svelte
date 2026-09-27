<script lang="ts">
  import type { Snippet } from "svelte"
  import * as Drawer from "@todos/ui/drawer"

  // The sidebar: a drawer from the left, which the finger can drag shut. Rendered once by the shell, outside the top
  // bar, so it survives navigation and can slide away while the next page loads. Its content (SidebarNav) is server
  // HTML, the children slot. What the island does is all in the browser and all passing: open and close, filter the
  // rows while the user types, and mark the page the app is on.
  let { label, children }: { label: string; children: Snippet } = $props()

  let open = $state(false)
  let panel = $state<HTMLElement | null>(null)

  // The top bar's menu button is plain server-rendered HTML (the top bar is swapped on every page).
  $effect(() => {
    const openOnButton = (event: MouseEvent) => {
      if ((event.target as Element).closest("[data-sidebar-open]")) open = true
    }
    document.addEventListener("click", openOnButton)
    return () => document.removeEventListener("click", openOnButton)
  })

  // The panel's content is rendered anew each time it opens, from the server's HTML of the first page. The app has
  // moved on since, so the current page is marked here, from the address; the rest is as the server sent it.
  $effect(() => {
    const element = panel
    if (!open || !element) return
    for (const link of element.querySelectorAll<HTMLAnchorElement>("a[data-sidebar=menu-button]")) {
      const current = link.pathname === location.pathname
      link.toggleAttribute("data-active", current)
      if (current) link.setAttribute("aria-current", "page")
      else link.removeAttribute("aria-current")
    }

    // Tapping a destination closes the panel; HTMX loads the page underneath while it slides away.
    const closeOnLink = (event: MouseEvent) => {
      if ((event.target as Element).closest("a[href]")) open = false
    }
    // The search field filters the destinations, as the sidebars of Mail, Notes and Files do.
    const filter = (event: Event) => {
      const input = event.target as HTMLInputElement
      if (!input.matches("[data-sidebar-search]")) return
      const needle = input.value.trim().toLocaleLowerCase()
      const rows = [...element.querySelectorAll<HTMLElement>("[data-sidebar-item]")]
      for (const row of rows) row.hidden = !(row.textContent ?? "").toLocaleLowerCase().includes(needle)
      const empty = element.querySelector<HTMLElement>("[data-sidebar-empty]")
      if (empty) empty.hidden = rows.some((row) => !row.hidden)
    }
    element.addEventListener("click", closeOnLink)
    element.addEventListener("input", filter)
    return () => {
      element.removeEventListener("click", closeOnLink)
      element.removeEventListener("input", filter)
    }
  })
</script>

<!-- A side panel leaves the page where it is: no scaling back, as there is for a sheet from the bottom. -->
<Drawer.Root bind:open direction="left" shouldScaleBackground={false}>
  <Drawer.Content bind:ref={panel} aria-label={label}>
    <div class="flex h-full w-full flex-col overflow-hidden">{@render children()}</div>
  </Drawer.Content>
</Drawer.Root>
