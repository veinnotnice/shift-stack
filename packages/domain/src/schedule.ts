// Where a task shows up and in which order: the smart lists, overdue, grouping by day.
import { compareDates, type CalendarDate } from "./calendar.ts"
import { isOpen, priorityRank, type Task } from "./task.ts"

export const smartLists = ["today", "scheduled", "all", "flagged", "completed"] as const
export type SmartList = (typeof smartLists)[number]

export const isOverdue = (task: Task, today: CalendarDate): boolean =>
  isOpen(task) && task.due !== null && task.due.date < today

/** Due today, or overdue: what the Today screen shows. */
export const isForToday = (task: Task, today: CalendarDate): boolean =>
  isOpen(task) && task.due !== null && task.due.date <= today

export const belongsTo =
  (list: SmartList, today: CalendarDate) =>
  (task: Task): boolean => {
    switch (list) {
      case "today":
        return isForToday(task, today)
      case "scheduled":
        return isOpen(task) && task.due !== null
      case "all":
        return isOpen(task)
      case "flagged":
        return isOpen(task) && task.flagged
      case "completed":
        return !isOpen(task)
    }
  }

/** By due day, then time (all-day first), then priority (high first), then list position. Undated tasks last. */
export const byDue = (a: Task, b: Task): number => {
  if (a.due === null || b.due === null) return (a.due === null ? 1 : 0) - (b.due === null ? 1 : 0) || byPosition(a, b)
  return (
    compareDates(a.due.date, b.due.date) ||
    (a.due.time ?? "").localeCompare(b.due.time ?? "") ||
    priorityRank[b.priority] - priorityRank[a.priority] ||
    byPosition(a, b)
  )
}

export const byPosition = (a: Task, b: Task): number => a.position - b.position

/** Most recently completed first. */
export const byCompletion = (a: Task, b: Task): number => (b.completedAt ?? 0) - (a.completedAt ?? 0)

export const sortFor = (list: SmartList): ((a: Task, b: Task) => number) =>
  list === "completed" ? byCompletion : list === "all" || list === "flagged" ? byPosition : byDue

/** How many tasks each smart list holds. */
export const countSmartLists = (tasks: ReadonlyArray<Task>, today: CalendarDate): Record<SmartList, number> => {
  const counts = { today: 0, scheduled: 0, all: 0, flagged: 0, completed: 0 }
  for (const task of tasks) for (const list of Object.keys(counts) as SmartList[]) if (belongsTo(list, today)(task)) counts[list]++
  return counts
}

/** Tasks grouped by due day, days ascending, each day sorted by `byDue`. Undated tasks are left out. */
export const groupByDay = (tasks: ReadonlyArray<Task>): Array<{ date: CalendarDate; tasks: Task[] }> => {
  const days = new Map<CalendarDate, Task[]>()
  for (const task of tasks) if (task.due) days.set(task.due.date, [...(days.get(task.due.date) ?? []), task])
  return [...days.entries()]
    .sort(([a], [b]) => compareDates(a, b))
    .map(([date, dayTasks]) => ({ date, tasks: dayTasks.sort(byDue) }))
}
