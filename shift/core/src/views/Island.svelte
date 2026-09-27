<script lang="ts" module>
  // Tells islands apart in the rendered page, so nested islands and their slots can be matched up (see index.ts).
  let count = 0
</script>

<script lang="ts">
  import type { Snippet } from "svelte"

  // Where a Svelte island goes. The views render the island into it on the server; the client hydrates it.
  // Props travel as JSON, so they must be JSON-safe. Snippets given to it (children, or named ones) are its slots:
  // server HTML the island places where it wants, and HTMX owns inside.
  let {
    name,
    props = {},
    class: className,
    ...slots
  }: { name: string; props?: Record<string, unknown>; class?: string; [slot: string]: unknown } = $props()

  const key = String(++count)
  const snippets = $derived(Object.entries(slots).filter((entry): entry is [string, Snippet] => typeof entry[1] === "function"))
</script>

<!-- Markers only: views/index.ts replaces all of this with the rendered island and its slot templates. -->
<div data-island={name} data-props={JSON.stringify(props)} data-island-key={key} class={className}>
  {#each snippets as [slot, content] (slot)}
    <shift-slot-open data-key={key} data-name={slot}></shift-slot-open>{@render content()}<shift-slot-close data-key={key}></shift-slot-close>
  {/each}
  <shift-island-close data-key={key}></shift-island-close>
</div>
