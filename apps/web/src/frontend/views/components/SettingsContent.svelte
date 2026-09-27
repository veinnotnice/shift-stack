<script lang="ts">
  import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right"
  import Check from "@lucide/svelte/icons/check"
  import { buttonVariants } from "@testin/ui/button"
  import { m } from "#shared/paraglide/messages.js"
  import type { Chrome } from "#frontend/views/chrome.ts"
  import ThemeForm from "./ThemeForm.svelte"

  // What the settings sheet (a Sheet island in the top bar) shows: appearance, language, and what this app is.
  let { chrome }: { chrome: Chrome } = $props()

  const sourceUrl = "https://github.com/veinnotnice/shift-stack"
</script>

<div class="grid grid-cols-[4.5rem_1fr_4.5rem] items-center px-4 pt-3 pb-2">
  <span></span>
  <h2 class="text-center text-[17px] font-semibold tracking-tight">{m.settings()}</h2>
  <button type="button" data-sheet-close class={[buttonVariants({ variant: "plain", size: "sm" }), "justify-self-end px-0 text-[17px]"]}>
    {m.done()}
  </button>
</div>

<section class="flex flex-col px-4 pt-3">
  <h3 id="appearance-label" class="ios-section-header">{m.appearance()}</h3>
  <ThemeForm theme={chrome.theme} />
</section>

<section class="flex flex-col px-4 pt-7 pb-2">
  <h3 class="ios-section-header">{m.language()}</h3>
  <div class="ios-list">
    {#each chrome.languages as language (language.locale)}
      <!-- A full page load, not a swap: lang, dir and every string on the page change. The sheet starts closing at
           once, and the browser keeps painting this page until the new one is ready. -->
      <a
        href={language.href}
        hx-boost="false"
        data-sheet-close
        hreflang={language.locale}
        lang={language.locale}
        aria-current={language.current ? "true" : undefined}
        class="ios-row py-2.5"
      >
        <span class="flex flex-1 flex-col">
          <span>{language.name}</span>
          {#if language.localName !== language.name}
            <span class="text-subheadline text-muted-foreground">{language.localName}</span>
          {/if}
        </span>
        {#if language.current}<Check class="size-5 text-primary" strokeWidth={2.6} />{/if}
      </a>
    {/each}
  </div>
</section>

<!-- This app is a demo of SHiFT: said once, quietly, as iOS says what an app is, under About. -->
<section class="flex flex-col px-4 pt-7 pb-2">
  <h3 class="ios-section-header">{m.about()}</h3>
  <div class="ios-list">
    <a href={sourceUrl} hx-boost="false" target="_blank" rel="noopener" class="ios-row py-2.5">
      <span class="flex-1">{m.about_source()}</span>
      <ArrowUpRight class="size-5 text-muted-foreground" strokeWidth={2} />
    </a>
  </div>
  <p class="ios-section-footer">{m.about_footer()}</p>
</section>
