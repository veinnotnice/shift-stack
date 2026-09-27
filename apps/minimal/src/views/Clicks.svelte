<script lang="ts">
  // State lives on the server: every click is a request, and the answer is this form with the new count.
  let { count }: { count: number } = $props()
</script>

<form hx-post="/clicks" hx-target="this" hx-swap="outerHTML">
  <button type="submit" class="rounded-md border border-neutral-300 px-4 py-2 hover:bg-neutral-100">
    Clicked {count} {count === 1 ? "time" : "times"}
  </button>
</form>
