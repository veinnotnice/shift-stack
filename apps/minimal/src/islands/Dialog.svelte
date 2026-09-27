<script lang="ts">
  import type { Snippet } from "svelte"

  // An island owns only what happens in the browser while it happens: here, a dialog opening and closing. What it
  // shows comes from the server as slots (the trigger's label, and the children), and HTMX runs the form in them.
  let { trigger, children }: { trigger: Snippet; children: Snippet } = $props()
  let dialog = $state<HTMLDialogElement>()
</script>

<button type="button" onclick={() => dialog?.showModal()} class="rounded-md border border-neutral-300 px-4 py-2 hover:bg-neutral-100">
  {@render trigger()}
</button>

<dialog bind:this={dialog} closedby="any" class="m-auto w-[calc(100%-2rem)] max-w-sm rounded-lg p-6 backdrop:bg-black/40">
  <div class="flex flex-col gap-4">
    {@render children()}
    <button type="button" onclick={() => dialog?.close()} class="self-end text-sm text-neutral-500 hover:underline">Close</button>
  </div>
</dialog>
