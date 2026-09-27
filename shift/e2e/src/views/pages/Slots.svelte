<script lang="ts">
  import { Island } from "@shift-stack/core/views"
  import NameForm from "../NameForm.svelte"
</script>

<svelte:head><title>Slots</title></svelte:head>

<h2 data-page="slots">Slots</h2>
<Island name="Disclosure" props={{ id: "disclosure" }}>
  <NameForm />
  <Island name="Counter" props={{ id: "nested" }} />
</Island>
