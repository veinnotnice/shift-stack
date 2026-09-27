<script lang="ts">
  import type { CalendarDate } from "@testin/domain/calendar"
  import type { TaskList } from "@testin/domain/list"
  import type { Task } from "@testin/domain/task"
  import { listColor } from "#lib/list-style.ts"
  import DoneTasks from "#frontend/views/components/DoneTasks.svelte"
  import OpenTasks from "#frontend/views/components/OpenTasks.svelte"
  import List from "#frontend/views/List.svelte"
  import PageHeader from "#frontend/views/PageHeader.svelte"

  let {
    list,
    open,
    completed,
    today
  }: { list: TaskList; open: Task[]; completed: Task[]; today: CalendarDate } = $props()
</script>

<PageHeader title={list.name} tint={listColor(list.color)} />

<div class="flex flex-col gap-8">
  <List><OpenTasks {list} {open} {today} /></List>
  <DoneTasks {list} {completed} {today} />
</div>
