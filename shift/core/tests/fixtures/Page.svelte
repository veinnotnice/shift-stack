<script lang="ts">
  import { Island } from "@shift-stack/core/views"

  let { open }: { open: boolean } = $props()
</script>

<Island name="Leaf" props={{ text: "alone" }} />
<Island name="Box" props={{ open }} class="box">
  {#snippet label()}<span>Open</span>{/snippet}
  <form action="/lists"><input name="name" /></form>
  <Island name="Leaf" props={{ text: "nested" }} />
</Island>
