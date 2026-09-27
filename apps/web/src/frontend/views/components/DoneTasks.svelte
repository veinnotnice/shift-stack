<script lang="ts">
  import ChevronRight from "@lucide/svelte/icons/chevron-right"
  import type { CalendarDate } from "@testin/domain/calendar"
  import type { TaskList } from "@testin/domain/list"
  import type { Task } from "@testin/domain/task"
  import { m } from "#shared/paraglide/messages.js"
  import TaskRow from "./TaskRow.svelte"

  // A list's completed tasks, folded away. The section is always in the page and hides itself while empty.
  // With `oob`, only its count and rows are sent (after completing or reopening a task): swapping those two
  // keeps the <details> element, so an open section stays open.
  let {
    list,
    completed,
    today,
    oob = false
  }: { list: TaskList; completed: Task[]; today: CalendarDate; oob?: boolean } = $props()
</script>

{#snippet count()}
  <span id="done-count-{list.id}" hx-swap-oob={oob ? "true" : undefined}>{m.completed_count({ count: completed.length })}</span>
{/snippet}

{#snippet rows()}
  <div id="done-rows-{list.id}" class="ios-list done-rows" hx-swap-oob={oob ? "true" : undefined}>
    {#each completed as task (task.id)}<TaskRow {task} {list} {today} showList={false} />{/each}
  </div>
{/snippet}

{#if oob}
  {@render count()}
  {@render rows()}
{:else}
  <details class="group flex flex-col has-[.done-rows:empty]:hidden">
    <summary class="ios-section-header flex cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
      {@render count()}
      <ChevronRight class="size-4 transition-transform group-open:rotate-90" strokeWidth={2.4} />
    </summary>
    {@render rows()}
  </details>
{/if}
