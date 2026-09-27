<script lang="ts">
  import type { Component } from "svelte"
  import { contentTarget, Island } from "@shift-stack/core/views"
  import Bar from "./Bar.svelte"

  // The layout most pages render in: a bar that changes with the page, links, the page, and an island that stays.
  let { title, page: Page, pageProps }: { title: string; page: Component<any>; pageProps: Record<string, unknown> } = $props()
</script>

<Bar {title} />

<nav>
  <a href="/">Home</a>
  <a href="/second">Second</a>
  <a href="/slots">Slots</a>
  <a href="/swap">Swap</a>
  <a href="/reload">Reload</a>
  <a href="/slow?ms=800&label=slow">Slow</a>
  <a href="/slow?ms=0&label=fast">Fast</a>
  <a href="/missing">Missing</a>
</nav>

<main id={contentTarget}>
  <Page {...pageProps} />
</main>

<Island name="Counter" props={{ id: "shell" }} />
