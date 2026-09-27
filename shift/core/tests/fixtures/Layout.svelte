<script lang="ts">
  import type { Component } from "svelte"
  import { contentTarget } from "@shift-stack/core/views"

  let { page: Page, pageProps }: { page: Component<any>; pageProps: Record<string, unknown> } = $props()
</script>

<main id={contentTarget}><Page {...pageProps} /></main>
