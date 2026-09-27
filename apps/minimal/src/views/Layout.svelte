<script lang="ts">
  import type { Component } from "svelte"
  import { contentTarget } from "@shift-stack/core/views"

  // Around every page. Links are boosted: HTMX fetches the next page and swaps it into the content target.
  let { page: Page, pageProps }: { page: Component<any>; pageProps: Record<string, unknown> } = $props()
</script>

<div class="mx-auto flex min-h-dvh max-w-xl flex-col gap-8 px-4 py-8 text-neutral-900">
  <nav class="flex gap-4 text-sm font-medium">
    <a href="/" class="hover:underline">Home</a>
    <a href="/about" class="hover:underline">About</a>
  </nav>

  <main id={contentTarget} class="flex-1">
    <Page {...pageProps} />
  </main>

  <footer class="text-xs text-neutral-500">Built with SHiFT</footer>
</div>
