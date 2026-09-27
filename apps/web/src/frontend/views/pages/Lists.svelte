<script lang="ts">
  import CalendarDays from "@lucide/svelte/icons/calendar-days"
  import CircleCheck from "@lucide/svelte/icons/circle-check"
  import ChevronRight from "@lucide/svelte/icons/chevron-right"
  import Flag from "@lucide/svelte/icons/flag"
  import Inbox from "@lucide/svelte/icons/inbox"
  import Plus from "@lucide/svelte/icons/plus"
  import Sun from "@lucide/svelte/icons/sun"
  import type { SmartList } from "@todos/domain/schedule"
  import type { Overview } from "@todos/services/ListService"
  import { listColor, listIcons } from "#lib/list-style.ts"
  import { m } from "#shared/paraglide/messages.js"
  import { localizeHref } from "#shared/paraglide/runtime.js"
  import { Island } from "@shift-stack/core/views"
  import List from "#frontend/views/List.svelte"
  import NewListForm from "#frontend/views/components/NewListForm.svelte"
  import PageHeader from "#frontend/views/PageHeader.svelte"

  let { overview }: { overview: Overview } = $props()

  // Reminders' smart lists, as tiles: symbol and count on top, name below.
  const tiles: Array<{ kind: SmartList; label: () => string; icon: typeof Sun; color: string; href: string }> = [
    { kind: "today", label: m.smart_today, icon: Sun, color: "var(--ios-blue)", href: "/" },
    { kind: "scheduled", label: m.smart_scheduled, icon: CalendarDays, color: "var(--ios-red)", href: "/smart/scheduled" },
    { kind: "all", label: m.smart_all, icon: Inbox, color: "var(--ios-gray)", href: "/smart/all" },
    { kind: "flagged", label: m.smart_flagged, icon: Flag, color: "var(--ios-orange)", href: "/smart/flagged" }
  ]
</script>

<PageHeader title={m.tab_lists()} />

<div class="flex flex-col gap-8">
  <div class="grid grid-cols-2 gap-3">
    {#each tiles as tile (tile.kind)}
      {@const Icon = tile.icon}
      <a href={localizeHref(tile.href)} class="ios-list flex flex-col gap-2 p-3.5 active:bg-row-highlight">
        <span class="flex items-start justify-between">
          <Icon class="size-7" style="color: {tile.color}" strokeWidth={2} />
          <span class="text-title2">{overview.smart[tile.kind]}</span>
        </span>
        <span class="text-subheadline font-semibold text-muted-foreground">{tile.label()}</span>
      </a>
    {/each}
  </div>

  <List header={m.my_lists()}>
    {#each overview.lists as { list, open } (list.id)}
      {@const Icon = listIcons[list.icon]}
      <a href={localizeHref(`/lists/${list.id}`)} class="ios-row [--separator-inset:52px]">
        <Icon class="size-[22px] shrink-0" style="color: {listColor(list.color)}" strokeWidth={2} />
        <span class="min-w-0 flex-1 truncate">{list.name}</span>
        <span class="text-muted-foreground">{open}</span>
        <ChevronRight class="size-4.5 text-tertiary-foreground" strokeWidth={2.4} />
      </a>
    {/each}
    <a href={localizeHref("/smart/completed")} class="ios-row [--separator-inset:52px]">
      <CircleCheck class="size-[22px] shrink-0 text-(--ios-gray)" strokeWidth={2} />
      <span class="flex-1">{m.smart_completed()}</span>
      <span class="text-muted-foreground">{overview.smart.completed}</span>
      <ChevronRight class="size-4.5 text-tertiary-foreground" strokeWidth={2.4} />
    </a>
  </List>

  <!-- The sheet is the island; the form in it is the server's. -->
  <Island name="Sheet" props={{ title: m.new_list(), variant: "secondary", wide: true }} class="min-h-[50px]">
    {#snippet trigger()}<Plus strokeWidth={2.4} />{m.new_list()}{/snippet}
    <NewListForm />
  </Island>
</div>
