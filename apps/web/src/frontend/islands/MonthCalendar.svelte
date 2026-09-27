<script lang="ts">
  import { parseDate, type DateValue } from "@internationalized/date"
  import type { Snippet } from "svelte"
  import type { ListColor } from "@testin/domain/list"
  import { listColor } from "#lib/list-style.ts"
  import { Calendar } from "@testin/ui/calendar"
  import * as CalendarParts from "@testin/ui/calendar"
  import { getLocale } from "#shared/paraglide/runtime.js"

  // The month on the Calendar screen: the shadcn Calendar, with dots in the list colours under days that have
  // tasks. Picking a day, or moving to another month, asks the server for that day through its form (the children
  // slot: a GET form with a `day` field), which answers with the page.
  let { selected, marks, children }: { selected: string; marks: Record<string, ListColor[]>; children: Snippet } = $props()

  let form = $state<HTMLElement | null>(null)

  // The day being asked for. Tapping a day of the next or previous month also moves the calendar to that month;
  // that move must not win over the day itself.
  let requested = $derived(selected)

  const go = (date: string) => {
    const dayForm = form?.querySelector("form")
    if (date === requested || !dayForm) return
    requested = date
    dayForm.querySelector<HTMLInputElement>("[name=day]")!.value = date
    dayForm.requestSubmit()
  }

  const pickDay = (value: DateValue | undefined) => {
    if (value) go(value.toString())
  }

  // Moving to another month with the arrows picks its first day, as Calendar does.
  const showMonth = (placeholder: DateValue | undefined) => {
    const month = placeholder?.toString().slice(0, 7)
    if (month && month !== requested.slice(0, 7)) go(`${month}-01`)
  }
</script>

<Calendar
  type="single"
  value={parseDate(selected)}
  placeholder={parseDate(selected)}
  onValueChange={pickDay}
  onPlaceholderChange={showMonth}
  locale={getLocale()}
  weekStartsOn={1}
  fixedWeeks
>
  {#snippet day({ day: date })}
    <CalendarParts.Day />
    <span class="flex h-1.5 gap-0.5" aria-hidden="true">
      {#each marks[date.toString()] ?? [] as color (color)}
        <span class="size-1.5 rounded-full" style="background: {listColor(color)}"></span>
      {/each}
    </span>
  {/snippet}
</Calendar>

<div bind:this={form} hidden>{@render children()}</div>
