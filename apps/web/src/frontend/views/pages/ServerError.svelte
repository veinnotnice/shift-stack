<script lang="ts">
  import { m } from "#shared/paraglide/messages.js"
  import PageHeader from "#frontend/views/PageHeader.svelte"
</script>

<PageHeader title={m.error_title()}>{m.error_body()}</PageHeader>
