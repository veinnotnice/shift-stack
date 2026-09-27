<script lang="ts">
  import { Island } from "@shift-stack/core/views"

  // How often the server rendered this page: the button asks the server, which answers with `refresh`.
  let { loads }: { loads: number } = $props()
</script>

<svelte:head><title>Reload</title></svelte:head>

<h2 data-page="reload">Reload</h2>
<p data-loads>{loads}</p>
<button type="button" hx-post="/reload" hx-swap="none">Reload</button>
<Island name="Counter" props={{ id: "reload" }} />
