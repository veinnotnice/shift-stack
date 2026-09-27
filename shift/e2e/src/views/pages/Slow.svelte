<script lang="ts">
  // Answered after a delay the link asks for, to race navigations.
  let { label }: { label: string } = $props()
</script>

<svelte:head><title>{label}</title></svelte:head>

<h2 data-page="slow">{label}</h2>
