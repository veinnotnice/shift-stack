<script lang="ts">
  import Plus from "@lucide/svelte/icons/plus"
  import type { CalendarDate } from "@todos/domain/calendar"
  import type { TaskList } from "@todos/domain/list"
  import type { Task } from "@todos/domain/task"
  import { listColor } from "#lib/list-style.ts"
  import { m } from "#shared/paraglide/messages.js"
  import { localizeHref } from "#shared/paraglide/runtime.js"
  import { Input } from "@todos/ui/input"
  import TaskRow from "./TaskRow.svelte"

  // A list's open tasks and the row to add one. Sits inside an ios-list; `oob` sends it along with another
  // response (reopening a task puts it back here).
  let { list, open, today, oob = false }: { list: TaskList; open: Task[]; today: CalendarDate; oob?: boolean } = $props()
</script>

<div id="open-{list.id}" class="contents" hx-swap-oob={oob ? "true" : undefined}>
  {#each open as task (task.id)}<TaskRow {task} {list} {today} showList={false} />{/each}
  <!-- Adding stays in the list: the new row lands above this one, and the field is ready for the next task. -->
  <form
    class="ios-row [--separator-inset:50px]"
    hx-post={localizeHref(`/lists/${list.id}/tasks`)}
    hx-target="this"
    hx-swap="beforebegin"
    hx-on--after-request={"if (event.detail.successful) { this.reset(); this.elements.title.focus() }"}
  >
    <Plus class="size-[22px] shrink-0 text-tertiary-foreground" strokeWidth={2} />
    <label class="sr-only" for="new-task-{list.id}">{m.new_task()}</label>
    <Input
      variant="plain"
      id="new-task-{list.id}"
      name="title"
      placeholder={m.new_task()}
      autocomplete="off"
      enterkeyhint="done"
      style="caret-color: {listColor(list.color)}"
    />
  </form>
</div>
