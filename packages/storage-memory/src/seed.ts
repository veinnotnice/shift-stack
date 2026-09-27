// Something to look at on first start: a few lists and tasks, dated relative to today so every screen has content.
import { addDays, type CalendarDate, TimeOfDay } from "@testin/domain/calendar"
import { ListId, type TaskList } from "@testin/domain/list"
import { SubtaskId, TaskId, type Task } from "@testin/domain/task"

export const seed = (today: CalendarDate, now: number): { lists: TaskList[]; tasks: Task[] } => {
  const personal = ListId.make("personal")
  const work = ListId.make("work")
  const groceries = ListId.make("groceries")

  const lists: TaskList[] = [
    { id: personal, name: "Persönlich", color: "blue", icon: "house", position: 0 },
    { id: work, name: "Arbeit", color: "orange", icon: "briefcase", position: 1 },
    { id: groceries, name: "Einkaufen", color: "green", icon: "cart", position: 2 }
  ]

  let position = 0
  const task = (listId: ListId, title: string, fields: Partial<Task> = {}): Task => ({
    id: TaskId.make(`seed-${position}`),
    listId,
    title,
    notes: "",
    due: null,
    priority: "none",
    flagged: false,
    recurrence: null,
    subtasks: [],
    position: position++,
    createdAt: now,
    completedAt: null,
    ...fields
  })
  const on = (days: number, time: string | null = null) => ({
    date: addDays(today, days),
    time: time === null ? null : TimeOfDay.make(time)
  })

  const tasks: Task[] = [
    task(personal, "Zahnarzttermin vereinbaren", { due: on(-1), priority: "high" }),
    task(personal, "10 Minuten lesen", { due: on(0), recurrence: { kind: "daily", every: 1 } }),
    task(personal, "Geburtstagsgeschenk für Mia", {
      due: on(3),
      flagged: true,
      notes: "Etwas zum Zeichnen?",
      subtasks: [
        { id: SubtaskId.make("gift-1"), title: "Ideen sammeln", done: true },
        { id: SubtaskId.make("gift-2"), title: "Bestellen", done: false }
      ]
    }),
    task(personal, "Steuererklärung", { due: on(12), priority: "medium" }),
    task(work, "Wochenplanung", { due: on(0, "09:00"), recurrence: { kind: "weekly", every: 1, weekdays: [1] } }),
    task(work, "Präsentation überarbeiten", { due: on(0, "14:30"), priority: "high", flagged: true }),
    task(work, "Feedback an Jonas", { due: on(1) }),
    task(work, "Quartalszahlen prüfen", { due: on(6), priority: "medium" }),
    task(work, "Ideen für das Offsite"),
    task(groceries, "Hafermilch"),
    task(groceries, "Tomaten"),
    task(groceries, "Kaffee", { flagged: true }),
    task(groceries, "Brot", { completedAt: now - 3_600_000 })
  ]

  return { lists, tasks }
}
