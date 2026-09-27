import { describe, expect, it } from "vitest"
import { CalendarDate, TimeOfDay } from "@todos/domain/calendar"
import { ListId } from "@todos/domain/list"
import { belongsTo, byDue, countSmartLists, groupByDay, isOverdue } from "@todos/domain/schedule"
import { TaskId, type Task } from "@todos/domain/task"

const today = CalendarDate.make("2026-09-28")

const task = (id: string, fields: Partial<Task> = {}): Task => ({
  id: TaskId.make(id),
  listId: ListId.make("l"),
  title: id,
  notes: "",
  due: null,
  priority: "none",
  flagged: false,
  recurrence: null,
  subtasks: [],
  position: 0,
  createdAt: 0,
  completedAt: null,
  ...fields
})
const due = (date: string, time: string | null = null) => ({
  date: CalendarDate.make(date),
  time: time === null ? null : TimeOfDay.make(time)
})

const overdue = task("overdue", { due: due("2026-09-27") })
const morning = task("morning", { due: due("2026-09-28", "09:00") })
const allDay = task("allDay", { due: due("2026-09-28") })
const later = task("later", { due: due("2026-10-02"), flagged: true })
const undated = task("undated")
const done = task("done", { due: due("2026-09-20"), completedAt: 1 })
const tasks = [later, undated, done, morning, overdue, allDay]

describe("schedule", () => {
  it("knows overdue: open, dated, before today", () => {
    expect(isOverdue(overdue, today)).toBe(true)
    expect(isOverdue(allDay, today)).toBe(false)
    expect(isOverdue(done, today)).toBe(false)
  })

  it("puts overdue and today's tasks on Today, completed ones only on Completed", () => {
    expect(tasks.filter(belongsTo("today", today)).map((t) => t.id).sort()).toEqual(["allDay", "morning", "overdue"])
    expect(tasks.filter(belongsTo("scheduled", today))).toHaveLength(4)
    expect(tasks.filter(belongsTo("all", today))).toHaveLength(5)
    expect(tasks.filter(belongsTo("flagged", today)).map((t) => t.id)).toEqual(["later"])
    expect(tasks.filter(belongsTo("completed", today)).map((t) => t.id)).toEqual(["done"])
  })

  it("sorts by day, all-day before timed, high priority first, undated last", () => {
    const urgent = task("urgent", { due: due("2026-09-28", "09:00"), priority: "high" })
    expect([undated, later, morning, urgent, allDay, overdue].sort(byDue).map((t) => t.id)).toEqual([
      "overdue",
      "allDay",
      "urgent",
      "morning",
      "later",
      "undated"
    ])
  })

  it("counts every smart list", () => {
    expect(countSmartLists(tasks, today)).toEqual({ today: 3, scheduled: 4, all: 5, flagged: 1, completed: 1 })
  })

  it("groups dated tasks by day", () => {
    expect(groupByDay([later, morning, allDay, undated]).map((g) => [g.date, g.tasks.map((t) => t.id)])).toEqual([
      ["2026-09-28", ["allDay", "morning"]],
      ["2026-10-02", ["later"]]
    ])
  })
})
