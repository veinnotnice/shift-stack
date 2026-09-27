<script lang="ts">
  import { track } from "./probe.ts"

  // Counts clicks: the server renders 0, and only a hydrated island counts on.
  let { id }: { id: string } = $props()
  let count = $state(0)

  track(() => id)
</script>

<button type="button" data-counter={id} onclick={() => count++}>{count}</button>
