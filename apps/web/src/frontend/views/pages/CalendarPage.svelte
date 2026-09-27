<script lang="ts">
  import type { CalendarDate } from "@todos/domain/calendar"
  import type { ListColor, TaskList } from "@todos/domain/list"
  import type { Task } from "@todos/domain/task"
  import { dayLabel } from "#lib/dates.ts"
  import { m } from "#shared/paraglide/messages.js"
  import { localizeHref } from "#shared/paraglide/runtime.js"
  import TaskRow from "#frontend/views/components/TaskRow.svelte"
  import { Island } from "@shift-stack/core/views"
  import List from "#frontend/views/List.svelte"
  import PageHeader from "#frontend/views/PageHeader.svelte"

  let {
    today,
    day,
    marks,
    tasks,
    lists
  }: { today: CalendarDate; day: CalendarDate; marks: Record<string, ListColor[]>; tasks: Task[]; lists: TaskList[] } = $props()

  const listOf = (task: Task) => lists.find((list) => list.id === task.listId)!
</script>

<PageHeader title={m.tab_calendar()} />

<div class="flex flex-col gap-8">
  <!-- The month, on a card. min-h keeps its six weeks' height while the island hydrates. -->
  <div class="ios-list px-2 pt-2 pb-3">
    <Island name="MonthCalendar" props={{ selected: day, marks }} class="block min-h-[372px]">
      <form hx-get={localizeHref("/calendar")}><input type="hidden" name="day" value={day} /></form>
    </Island>
  </div>

  {#if tasks.length > 0}
    <List header={dayLabel(day, today)}>
      {#each tasks as task (task.id)}<TaskRow {task} list={listOf(task)} {today} showList />{/each}
    </List>
  {:else}
    <section class="flex flex-col">
      <h2 class="ios-section-header">{dayLabel(day, today)}</h2>
      <p class="py-6 text-center text-subheadline text-muted-foreground">{m.nothing_here()}</p>
    </section>
  {/if}
</div>
