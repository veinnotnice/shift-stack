<script lang="ts">
  import type { Component } from "svelte"
  import { m } from "#shared/paraglide/messages.js"
  import type { Chrome } from "./chrome.ts"
  import { contentTarget, Island } from "@shift-stack/core/views"
  import SidebarNav from "./SidebarNav.svelte"
  import TabBar from "./TabBar.svelte"
  import TopBar from "./TopBar.svelte"

  let {
    chrome,
    page: Page,
    pageProps
  }: { chrome: Chrome; page: Component<any>; pageProps: Record<string, unknown> } = $props()
</script>

<!-- A phone-width column. data-vaul-drawer-wrapper: opening the settings sheet scales this back, as iOS does. -->
<div data-vaul-drawer-wrapper class="relative mx-auto min-h-dvh max-w-md bg-background">
  <TopBar {chrome} />

  <main id={contentTarget} class="px-4 pb-[calc(max(env(safe-area-inset-bottom),14px)+96px)]">
    <Page {...pageProps} />
  </main>

  <TabBar {chrome} />
</div>

<!-- Outside the bars and the page, so it survives navigation and can slide out while the next page loads. -->
<Island name="Sidebar" props={{ label: m.menu() }} class="contents"><SidebarNav {chrome} /></Island>
<Island name="Toaster" props={{ theme: chrome.theme }} />
