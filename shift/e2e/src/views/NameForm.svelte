<script lang="ts">
  // Answers in place: 422 with the error, or 200 with what was saved.
  let { value = "", error, saved = false }: { value?: string; error?: string; saved?: boolean } = $props()
</script>

<form hx-post="/name" hx-target="this" hx-swap="outerHTML">
  <input name="name" {value} />
  <button type="submit">Save</button>
  {#if error}<p data-error>{error}</p>{/if}
  {#if saved}<p data-saved>Saved {value}</p>{/if}
</form>
