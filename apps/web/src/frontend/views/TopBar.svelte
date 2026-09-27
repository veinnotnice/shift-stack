<script lang="ts">
  import PanelLeft from "@lucide/svelte/icons/panel-left"
  import Settings from "@lucide/svelte/icons/settings"
  import { buttonVariants } from "@todos/ui/button"
  import { m } from "#shared/paraglide/messages.js"
  import type { Chrome } from "./chrome.ts"
  import { Island } from "@shift-stack/core/views"
  import SettingsContent from "./components/SettingsContent.svelte"

  // `oob` sends it along with a boosted page swap, so the title and the language links follow the page.
  let { chrome, oob = false }: { chrome: Chrome; oob?: boolean } = $props()
</script>

<!-- See-through over the large title, iOS material once the page scrolls under it (globals.css). -->
<header id="top-bar" hx-swap-oob={oob ? "true" : undefined} class="top-bar sticky top-0 z-30 pt-[env(safe-area-inset-top)]">
  <div class="grid h-13 grid-cols-[2.25rem_1fr_2.25rem] items-center gap-2 px-4">
    <!-- Opens the sidebar island in the shell. Plain HTML, because this bar is replaced on every page. -->
    <button
      type="button"
      data-sidebar-open
      aria-label={m.menu()}
      class={buttonVariants({ variant: "neutral", size: "icon-sm" })}
    >
      <PanelLeft class="size-5" strokeWidth={2} />
    </button>
    <p class="bar-title truncate text-center text-headline">{chrome.title}</p>
    <Island name="Sheet" props={{ title: m.settings(), label: m.settings(), variant: "neutral", size: "icon-sm" }} class="size-9 justify-self-end">
      {#snippet trigger()}<Settings class="size-5" strokeWidth={2} />{/snippet}
      <SettingsContent {chrome} />
    </Island>
  </div>
</header>
