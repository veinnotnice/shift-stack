<script lang="ts">
  import type { Snippet } from "svelte"
  import { m } from "#shared/paraglide/messages.js"

  // The iOS large title. On scroll it gives way to the small title in the top bar (globals.css).
  // `tint` colours it, as Reminders colours a list's title in the list's colour.
  let { title, tint, children }: { title: string; tint?: string; children?: Snippet } = $props()
</script>

<svelte:head><title>{title} · {m.app_name()}</title></svelte:head>

<div class="flex flex-col gap-1 pt-0.5 pb-4">
  <h1 class="large-title text-large-title" style:color={tint}>{title}</h1>
  {#if children}<div class="text-subheadline text-muted-foreground">{@render children()}</div>{/if}
</div>
