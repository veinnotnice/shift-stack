<script lang="ts">
  import type { CalendarDate } from "@todos/domain/calendar"
  import type { TaskList } from "@todos/domain/list"
  import type { Task } from "@todos/domain/task"
  import { longDate } from "#lib/dates.ts"
  import { m } from "#shared/paraglide/messages.js"
  import TaskRow from "#frontend/views/components/TaskRow.svelte"
  import List from "#frontend/views/List.svelte"
  import PageHeader from "#frontend/views/PageHeader.svelte"

  let { today, overdue, dueToday, lists }: { today: CalendarDate; overdue: Task[]; dueToday: Task[]; lists: TaskList[] } =
    $props()

  const listOf = (task: Task) => lists.find((list) => list.id === task.listId)!
</script>

<PageHeader title={m.smart_today()}>{longDate(today)}</PageHeader>

<div class="flex flex-col gap-8">
  {#if overdue.length > 0}
    <List header={m.overdue()}>
      {#each overdue as task (task.id)}<TaskRow {task} list={listOf(task)} {today} showList />{/each}
    </List>
  {/if}
  {#if dueToday.length > 0}
    <List header={overdue.length > 0 ? m.smart_today() : undefined}>
      {#each dueToday as task (task.id)}<TaskRow {task} list={listOf(task)} {today} showList />{/each}
    </List>
  {/if}
  {#if overdue.length === 0 && dueToday.length === 0}
    <p class="py-20 text-center text-subheadline text-muted-foreground">{m.nothing_today()}</p>
  {/if}
</div>
