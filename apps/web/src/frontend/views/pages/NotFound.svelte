<script lang="ts">
  import { m } from "#shared/paraglide/messages.js"
  import PageHeader from "#frontend/views/PageHeader.svelte"
</script>

<PageHeader title={m.not_found_title()}>{m.not_found_body()}</PageHeader>
