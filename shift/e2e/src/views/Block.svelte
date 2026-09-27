<script lang="ts">
  import { Island } from "@shift-stack/core/views"

  // Replaces itself, island and all.
  let { n }: { n: number } = $props()
</script>

<div id="block">
  <Island name="Counter" props={{ id: `block-${n}` }} />
  <button type="button" hx-get={`/block?n=${n + 1}`} hx-target="#block" hx-swap="outerHTML">Next</button>
</div>
