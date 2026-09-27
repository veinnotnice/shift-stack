<script lang="ts">
  import type { Snippet } from "svelte"

  // An island with two slots: a named one it always shows, and children it shows only when open.
  let { open = false, label, children }: { open?: boolean; label: Snippet; children: Snippet } = $props()
</script>

<button type="button">{@render label()}</button>
{#if open}<section>{@render children()}</section>{/if}
