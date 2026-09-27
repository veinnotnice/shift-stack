<script lang="ts">
  import type { Snippet } from "svelte"
  import { track } from "./probe.ts"

  // Shows its children slot only while open, as a sheet does: the slot leaves the page and comes back.
  let { id, children }: { id: string; children: Snippet } = $props()
  let open = $state(false)

  track(() => id)
</script>

<button type="button" data-toggle={id} onclick={() => (open = !open)}>{open ? "Close" : "Open"}</button>
{#if open}<div data-panel={id}>{@render children()}</div>{/if}
