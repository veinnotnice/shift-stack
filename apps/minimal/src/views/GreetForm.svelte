<script lang="ts">
  // A form that answers in place: the server sends it back with an error (422) or with the greeting.
  let { name = "", error, greeting }: { name?: string; error?: string; greeting?: string } = $props()
</script>

<form hx-post="/greet" hx-target="this" hx-swap="outerHTML" class="flex flex-col gap-2">
  <label for="name" class="text-sm font-medium">Your name</label>
  <div class="flex gap-2">
    <input
      id="name"
      name="name"
      value={name}
      aria-invalid={error ? "true" : undefined}
      class="flex-1 rounded-md border border-neutral-300 px-3 py-2 aria-invalid:border-red-500"
    />
    <button type="submit" class="rounded-md bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-700">Greet</button>
  </div>
  {#if error}<p class="text-sm text-red-600">{error}</p>{/if}
  {#if greeting}<p class="text-sm text-green-700">{greeting}</p>{/if}
</form>
