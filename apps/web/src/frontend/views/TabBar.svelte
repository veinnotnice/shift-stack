<script lang="ts">
  import { navIcons } from "#lib/nav-icons.ts"
  import type { Chrome } from "./chrome.ts"

  // `oob` sends it along with a boosted page swap, so the active tab follows the page.
  let { chrome, oob = false }: { chrome: Chrome; oob?: boolean } = $props()
</script>

<!-- A floating glass capsule. The selected tab is tinted, sitting on a soft lens; the others are plain label. -->
<nav
  id="tab-bar"
  hx-swap-oob={oob ? "true" : undefined}
  class="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md px-12 pb-[max(env(safe-area-inset-bottom),12px)]"
>
  <div class="glass pointer-events-auto flex rounded-full p-1">
    {#each chrome.nav as item (item.id)}
      {@const Icon = navIcons[item.id]}
      {@const active = chrome.active === item.id}
      <a
        href={item.href}
        aria-current={active ? "page" : undefined}
        class="pressable flex h-13.5 flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-caption2 font-semibold text-foreground aria-[current=page]:bg-foreground/[0.07] aria-[current=page]:text-primary"
      >
        <Icon class="size-6" strokeWidth={active ? 2.2 : 1.8} />
        {item.label}
      </a>
    {/each}
  </div>
</nav>
