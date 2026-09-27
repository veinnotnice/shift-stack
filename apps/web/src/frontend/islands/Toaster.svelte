<script lang="ts">
  import { Toaster } from "@testin/ui/sonner"
  import type { Theme } from "#shared/theme.ts"
  import { onMount } from "svelte"
  import { toast } from "svelte-sonner"

  // The server asks for a toast with `HX-Trigger: {"toast": {"kind": "success", "message": "..."}}`, optionally with
  // an action, a button that posts to `url` (Undo).
  type ToastRequest = {
    kind?: "success" | "info" | "error"
    message: string
    action?: { label: string; url: string }
  }

  const post = async (url: string) => {
    const { default: htmx } = await import("htmx.org")
    void htmx.ajax("post", url, { swap: "none" })
  }

  let { theme: initialTheme }: { theme: Theme } = $props()
  let theme = $derived(initialTheme)

  onMount(() => {
    const show = (event: Event) => {
      const { kind, message, action } = (event as CustomEvent<ToastRequest>).detail
      const options = action ? { action: { label: action.label, onClick: () => void post(action.url) } } : {}
      if (kind) toast[kind](message, options)
      else toast(message, options)
    }
    const follow = (event: Event) => (theme = (event as CustomEvent<Theme>).detail)
    document.body.addEventListener("toast", show)
    document.addEventListener("themechange", follow)
    return () => {
      document.body.removeEventListener("toast", show)
      document.removeEventListener("themechange", follow)
    }
  })
</script>

<!-- Top centre, clear of the tab bar; follows the theme chosen in settings. -->
<Toaster
  position="top-center"
  {theme}
  style="--normal-bg: var(--material-thick); --normal-border: transparent; --normal-text: var(--foreground); --border-radius: 22px;"
/>
