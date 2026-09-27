<script lang="ts">
  import { Island } from "@shift-stack/core/views"
  import Clicks from "../Clicks.svelte"
  import GreetForm from "../GreetForm.svelte"

  let { clicks }: { clicks: number } = $props()
</script>

<svelte:head><title>Home</title></svelte:head>

<div class="flex flex-col gap-8">
  <h1 class="text-3xl font-bold">Hello, SHiFT</h1>

  <section class="flex flex-col gap-2">
    <h2 class="font-semibold">State on the server</h2>
    <p class="text-sm text-neutral-600">The server counts. Reload the page: the count stays.</p>
    <Clicks count={clicks} />
  </section>

  <section class="flex flex-col gap-2">
    <h2 class="font-semibold">An island around server HTML</h2>
    <p class="text-sm text-neutral-600">The island only opens and closes the dialog. The form in it is the server's.</p>
    <Island name="Dialog">
      {#snippet trigger()}Say hello{/snippet}
      <GreetForm />
    </Island>
  </section>
</div>
