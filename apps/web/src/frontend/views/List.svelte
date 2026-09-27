<script lang="ts">
  import type { Snippet } from "svelte"

  // An iOS inset grouped section: an optional header, the rows (elements with class `ios-row`), an optional footer.
  let {
    header,
    footer,
    footerId,
    footerTone,
    children
  }: {
    header?: string
    footer?: string
    footerId?: string
    footerTone?: "destructive"
    children: Snippet
  } = $props()
</script>

<section class="flex flex-col">
  {#if header}<h2 class="ios-section-header">{header}</h2>{/if}
  <div class="ios-list">{@render children()}</div>
  {#if footer}
    <p id={footerId} class={["ios-section-footer", footerTone === "destructive" && "text-destructive"]}>{footer}</p>
  {/if}
</section>
