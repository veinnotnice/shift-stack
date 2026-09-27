<script lang="ts">
  import { Island } from "@shift-stack/core/views"

  let { title, oob = false }: { title: string; oob?: boolean } = $props()
</script>

<header id="bar" hx-swap-oob={oob ? "true" : undefined}>
  <h1 data-bar-title>{title}</h1>
  <Island name="Counter" props={{ id: "bar" }} />
</header>
