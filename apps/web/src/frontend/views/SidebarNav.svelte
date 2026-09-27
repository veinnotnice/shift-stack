<script lang="ts">
  import Search from "@lucide/svelte/icons/search"
  import * as Sidebar from "@todos/ui/sidebar"
  import { navIcons } from "#lib/nav-icons.ts"
  import { m } from "#shared/paraglide/messages.js"
  import type { Chrome } from "./chrome.ts"

  // What the sidebar island shows: the app's name, a search field and the destinations. The island filters the rows
  // as the user types and marks the page the app is on.
  let { chrome }: { chrome: Chrome } = $props()
</script>

<Sidebar.Header class="gap-3 px-4 pt-5 pb-2">
  <div class="px-1">
    <p class="text-large-title">{m.app_name()}</p>
    <p class="text-subheadline text-muted-foreground">{m.app_demo()}</p>
  </div>
  <!-- The iOS search field: a grey rounded well with a magnifying glass. -->
  <label class="flex h-9 items-center gap-1.5 rounded-[10px] bg-muted px-2 text-muted-foreground">
    <Search class="size-4.5 shrink-0" strokeWidth={2.2} />
    <span class="sr-only">{m.search()}</span>
    <input
      type="search"
      data-sidebar-search
      placeholder={m.search()}
      enterkeyhint="search"
      autocomplete="off"
      class="min-w-0 flex-1 bg-transparent text-body text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
    />
  </label>
</Sidebar.Header>
<Sidebar.Content>
  <Sidebar.Group class="px-3 pt-3">
    <Sidebar.GroupLabel class="h-auto px-2 pb-1.5 text-[20px] leading-[25px] font-bold tracking-[-0.02em] text-foreground">
      {m.sidebar_pages()}
    </Sidebar.GroupLabel>
    <Sidebar.Menu class="gap-0.5">
      {#each chrome.nav as item (item.id)}
        {@const Icon = navIcons[item.id]}
        {@const active = chrome.active === item.id}
        <Sidebar.MenuItem data-sidebar-item>
          <a
            href={item.href}
            data-slot="sidebar-menu-button"
            data-sidebar="menu-button"
            data-size="default"
            data-active={active || undefined}
            aria-current={active ? "page" : undefined}
            class={Sidebar.sidebarMenuButtonVariants()}
          >
            <Icon strokeWidth={2} />
            <span>{item.label}</span>
          </a>
        </Sidebar.MenuItem>
      {/each}
      <li data-sidebar-empty hidden class="px-2 py-6 text-center text-subheadline text-muted-foreground">{m.no_results()}</li>
    </Sidebar.Menu>
  </Sidebar.Group>
</Sidebar.Content>
