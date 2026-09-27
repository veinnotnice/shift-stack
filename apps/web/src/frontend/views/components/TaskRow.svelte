<script lang="ts">
  import Flag from "@lucide/svelte/icons/flag"
  import Repeat from "@lucide/svelte/icons/repeat"
  import { Checkbox } from "@testin/ui/checkbox"
  import type { CalendarDate } from "@testin/domain/calendar"
  import type { TaskList } from "@testin/domain/list"
  import { isOverdue } from "@testin/domain/schedule"
  import { priorityRank, type Task } from "@testin/domain/task"
  import { dayLabel, timeLabel } from "#lib/dates.ts"
  import { listColor } from "#lib/list-style.ts"
  import { m } from "#shared/paraglide/messages.js"
  import { localizeHref } from "#shared/paraglide/runtime.js"

  // One task, as Reminders draws it: a circle to tick, the title, and a line of what matters about it.
  // Ticking posts to the server, which takes the row out of the list.
  let { task, list, today, showList }: { task: Task; list: TaskList; today: CalendarDate; showList: boolean } = $props()

  const done = $derived(task.completedAt !== null)
  const overdue = $derived(isOverdue(task, today))
  const subtasksDone = $derived(task.subtasks.filter((subtask) => subtask.done).length)
  const action = (verb: string) => `${localizeHref(`/tasks/${task.id}/${verb}`)}?in=${showList ? "smart" : "list"}`
  const hasMeta = $derived(task.due !== null || task.recurrence !== null || task.subtasks.length > 0 || showList)
</script>

<div
  id="task-{task.id}"
  class="ios-row items-start py-2.5 [--separator-inset:50px]"
  style="--list: {listColor(list.color)}"
>
  <Checkbox
    checked={done}
    hx-post={action(done ? "reopen" : "complete")}
    hx-target="closest .ios-row"
    hx-swap="outerHTML"
    aria-label={done ? m.reopen_task() : m.complete_task()}
    class="mt-px"
    style="--checkbox-color: var(--list)"
  />

  <div class="flex min-w-0 flex-1 flex-col gap-0.5">
    <p class={[done && "text-muted-foreground"]}>
      {#if task.priority !== "none"}<span class="font-semibold text-(--list)" aria-label={m.priority_label()}
          >{"!".repeat(priorityRank[task.priority])}&nbsp;</span
        >{/if}{task.title}
    </p>
    {#if hasMeta}
      <p class="flex flex-wrap items-center gap-x-1.5 text-subheadline text-muted-foreground">
        {#if task.due}
          <span class={[overdue && "text-destructive"]}
            >{dayLabel(task.due.date, today)}{#if task.due.time}, {timeLabel(task.due.time)}{/if}</span
          >
        {/if}
        {#if task.recurrence}<Repeat class="size-3.5" aria-label={m.repeats()} />{/if}
        {#if task.subtasks.length > 0}<span>{subtasksDone}/{task.subtasks.length}</span>{/if}
        {#if showList}<span class="text-(--list)">{list.name}</span>{/if}
      </p>
    {/if}
  </div>

  {#if task.flagged}
    <Flag class="mt-0.5 size-4 shrink-0 fill-(--ios-orange) text-(--ios-orange)" aria-label={m.flagged()} />
  {/if}
</div>
