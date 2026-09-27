<script lang="ts">
  import type { CalendarDate } from "@testin/domain/calendar"
  import type { TaskList } from "@testin/domain/list"
  import { groupByDay } from "@testin/domain/schedule"
  import type { Task } from "@testin/domain/task"
  import { dayLabel } from "#lib/dates.ts"
  import { m } from "#shared/paraglide/messages.js"
  import TaskRow from "#frontend/views/components/TaskRow.svelte"
  import List from "#frontend/views/List.svelte"
  import PageHeader from "#frontend/views/PageHeader.svelte"

  // Scheduled, All, Flagged and Completed. Scheduled is grouped by day; the others are one list.
  let {
    kind,
    tasks,
    lists,
    today
  }: { kind: "scheduled" | "all" | "flagged" | "completed"; tasks: Task[]; lists: TaskList[]; today: CalendarDate } = $props()

  const titles = { scheduled: m.smart_scheduled, all: m.smart_all, flagged: m.smart_flagged, completed: m.smart_completed }
  const tints = { scheduled: "var(--ios-red)", all: undefined, flagged: "var(--ios-orange)", completed: undefined }
  const listOf = (task: Task) => lists.find((list) => list.id === task.listId)!
</script>

<PageHeader title={titles[kind]()} tint={tints[kind]} />

<div class="flex flex-col gap-8">
  {#if tasks.length === 0}
    <p class="py-20 text-center text-subheadline text-muted-foreground">{m.nothing_here()}</p>
  {:else if kind === "scheduled"}
    {#each groupByDay(tasks) as day (day.date)}
      <List header={dayLabel(day.date, today)}>
        {#each day.tasks as task (task.id)}<TaskRow {task} list={listOf(task)} {today} showList />{/each}
      </List>
    {/each}
  {:else}
    <List>
      {#each tasks as task (task.id)}<TaskRow {task} list={listOf(task)} {today} showList />{/each}
    </List>
  {/if}
</div>
