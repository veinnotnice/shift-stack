<script lang="ts">
  import type { Snippet } from "svelte"
  import { buttonVariants, type ButtonSize, type ButtonVariant } from "@testin/ui/button"
  import * as Drawer from "@testin/ui/drawer"

  // An iOS sheet around server HTML. The island owns only what happens in the browser: the trigger, the sheet sliding
  // up and away, open or closed. What is in it (a form, links) comes from the server as the children slot, and HTMX
  // runs it. The trigger's content (a symbol, a label) is the `trigger` slot; its look is a button variant.
  //
  // [data-sheet-close] closes the sheet: a button or link when tapped (Cancel, Done, a language), a form when the server
  // accepts it (2xx). A 422 keeps it open: the server answered with the form and its errors. Forms without the mark
  // (a setting that saves on change) leave it open.
  let {
    title,
    variant = "secondary",
    size = "default",
    label,
    wide = false,
    trigger,
    children
  }: {
    /** For assistive technology: the sheet's name. */
    title: string
    variant?: ButtonVariant
    size?: ButtonSize
    /** The trigger's accessible name, when its content is only a symbol. */
    label?: string
    /** The trigger fills its container's width. */
    wide?: boolean
    trigger: Snippet
    children: Snippet
  } = $props()

  let open = $state(false)
  let content = $state<HTMLElement | null>(null)

  $effect(() => {
    const element = content
    if (!element) return
    const closeOnMarked = (event: MouseEvent) => {
      if ((event.target as Element).closest("[data-sheet-close]:not(form)")) open = false
    }
    const closeOnSuccess = (event: Event) => {
      const { elt, xhr } = (event as CustomEvent<{ elt: Element; xhr: XMLHttpRequest }>).detail
      if (elt.matches("form[data-sheet-close]") && xhr.status >= 200 && xhr.status < 300) open = false
    }
    element.addEventListener("click", closeOnMarked)
    element.addEventListener("htmx:afterRequest", closeOnSuccess)
    return () => {
      element.removeEventListener("click", closeOnMarked)
      element.removeEventListener("htmx:afterRequest", closeOnSuccess)
    }
  })
</script>

<Drawer.Root bind:open>
  <Drawer.Trigger aria-label={label} class={[buttonVariants({ variant, size }), wide && "w-full"]}>
    {@render trigger()}
  </Drawer.Trigger>
  <Drawer.Content bind:ref={content} aria-label={title}>
    {@render children()}
  </Drawer.Content>
</Drawer.Root>
