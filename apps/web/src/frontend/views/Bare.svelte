<script lang="ts">
  import type { Component } from "svelte"
  import { buttonVariants } from "@testin/ui/button"
  import { contentTarget } from "@shift-stack/core/views"
  import { m } from "#shared/paraglide/messages.js"
  import { localizeHref } from "#shared/paraglide/runtime.js"

  // The layout of pages that stand on their own, without the bars: the error pages. The way back is its one action.
  let { page: Page, pageProps }: { page: Component<any>; pageProps: Record<string, unknown> } = $props()
</script>

<div
  class="relative mx-auto flex min-h-dvh max-w-md flex-col bg-background px-4 pt-[calc(env(safe-area-inset-top)+44px)] pb-[max(env(safe-area-inset-bottom),24px)]"
>
  <main id={contentTarget} class="flex-1">
    <Page {...pageProps} />
  </main>

  <a href={localizeHref("/")} class={buttonVariants({ class: "w-full" })}>{m.error_home()}</a>
</div>
