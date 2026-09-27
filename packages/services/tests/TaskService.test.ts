import { Effect } from "effect"
import { describe, expect, it } from "vitest"
import { CalendarDate, TimeOfDay } from "@todos/domain/calendar"
import { ListId } from "@todos/domain/list"
import { TaskId } from "@todos/domain/task"
import { TaskService } from "@todos/services/TaskService"
import { failure, inbox, now, run, work } from "./harness.ts"

const on = (date: string, time: string | null = null) => ({
  date: CalendarDate.make(date),
  time: time === null ? null : TimeOfDay.make(time)
})

describe("TaskService", () => {
  it("creates a task at the end of its list, with defaults", async () => {
    const [first, second] = await run(
      Effect.gen(function* () {
        const service = yield* TaskService
        return [
          yield* service.create({ listId: inbox.id, title: "One", notes: "", due: null, priority: "none", flagged: false, recurrence: null }),
          yield* service.create({ listId: inbox.id, title: "Two", notes: "", due: null, priority: "none", flagged: false, recurrence: null })
        ]
      })
    )
    expect(first!.position).toBe(0)
    expect(second!.position).toBe(1)
    expect(first!.createdAt).toBe(now)
    expect(first!.completedAt).toBeNull()
  })

  it("refuses a task for a list that doesn't exist", async () => {
    const error = await run(
      Effect.flatMap(TaskService, (s) =>
        failure(s.create({ listId: ListId.make("nope"), title: "x", notes: "", due: null, priority: "none", flagged: false, recurrence: null }))
      )
    )
    expect(error._tag).toBe("ListNotFound")
  })

  it("gives a repeating task without a date today as its date", async () => {
    const task = await run(
      Effect.flatMap(TaskService, (s) =>
        s.create({ listId: inbox.id, title: "Read", notes: "", due: null, priority: "none", flagged: false, recurrence: { kind: "daily", every: 1 } })
      )
    )
    expect(task.due).toEqual({ date: "2026-09-28", time: null })
  })

  it("completes a task, and takes it back", async () => {
    const result = await run(
      Effect.gen(function* () {
        const s = yield* TaskService
        const task = yield* s.create({ listId: inbox.id, title: "Call", notes: "", due: on("2026-09-28"), priority: "none", flagged: false, recurrence: null })
        const done = yield* s.complete(task.id)
        const today = yield* s.smart("today")
        const undone = yield* s.undoCompletion({ completedId: done.completed.id, nextId: null })
        return { done, today, undone, todayAfter: yield* s.smart("today") }
      })
    )
    expect(result.done.completed.completedAt).toBe(now)
    expect(result.done.next).toBeNull()
    expect(result.today).toHaveLength(0)
    expect(result.undone.completedAt).toBeNull()
    expect(result.todayAfter.map((t) => t.title)).toEqual(["Call"])
  })

  it("completing a repeating task keeps a done copy and moves the task on", async () => {
    const result = await run(
      Effect.gen(function* () {
        const s = yield* TaskService
        const task = yield* s.create({
          listId: inbox.id,
          title: "Standup",
          notes: "",
          due: on("2026-09-28", "09:00"),
          priority: "none",
          flagged: false,
          recurrence: { kind: "weekly", every: 1, weekdays: [1, 4] }
        })
        const withSub = yield* s.addSubtask(task.id, "Notes")
        yield* s.toggleSubtask(task.id, withSub.subtasks[0]!.id)
        const done = yield* s.complete(task.id)
        return { task, done, completed: yield* s.smart("completed"), scheduled: yield* s.smart("scheduled") }
      })
    )
    expect(result.done.completed.id).not.toBe(result.task.id)
    expect(result.done.completed.recurrence).toBeNull()
    expect(result.done.next!.id).toBe(result.task.id)
    expect(result.done.next!.due).toEqual({ date: "2026-10-01", time: "09:00" })
    expect(result.done.next!.subtasks.every((s) => !s.done)).toBe(true)
    expect(result.completed.map((t) => t.title)).toEqual(["Standup"])
    expect(result.scheduled.map((t) => t.due?.date)).toEqual(["2026-10-01"])
  })

  it("undoing a repeating completion puts the task back on its old date", async () => {
    const restored = await run(
      Effect.gen(function* () {
        const s = yield* TaskService
        const task = yield* s.create({
          listId: inbox.id,
          title: "Water plants",
          notes: "",
          due: on("2026-09-28"),
          priority: "none",
          flagged: false,
          recurrence: { kind: "daily", every: 2 }
        })
        const done = yield* s.complete(task.id)
        const back = yield* s.undoCompletion({ completedId: done.completed.id, nextId: done.next!.id })
        return { back, completed: yield* s.smart("completed") }
      })
    )
    expect(restored.back.due).toEqual({ date: "2026-09-28", time: null })
    expect(restored.completed).toHaveLength(0)
  })

  it("moves a task to another list, at its end", async () => {
    const moved = await run(
      Effect.gen(function* () {
        const s = yield* TaskService
        yield* s.create({ listId: work.id, title: "Existing", notes: "", due: null, priority: "none", flagged: false, recurrence: null })
        const task = yield* s.create({ listId: inbox.id, title: "Move me", notes: "", due: null, priority: "none", flagged: false, recurrence: null })
        return yield* s.update(task.id, { listId: work.id })
      })
    )
    expect(moved.listId).toBe("work")
    expect(moved.position).toBe(1)
  })

  it("reorders a list's open tasks", async () => {
    const order = await run(
      Effect.gen(function* () {
        const s = yield* TaskService
        const make = (title: string) =>
          s.create({ listId: inbox.id, title, notes: "", due: null, priority: "none", flagged: false, recurrence: null })
        const [a, b, c] = [yield* make("A"), yield* make("B"), yield* make("C")]
        yield* s.reorder(inbox.id, [c.id, a.id, b.id])
        return (yield* s.inList(inbox.id)).open.map((t) => t.title)
      })
    )
    expect(order).toEqual(["C", "A", "B"])
  })

  it("finds tasks for the calendar and by search", async () => {
    const result = await run(
      Effect.gen(function* () {
        const s = yield* TaskService
        const make = (title: string, due: ReturnType<typeof on> | null, notes = "") =>
          s.create({ listId: inbox.id, title, notes, due, priority: "none", flagged: false, recurrence: null })
        yield* make("Dentist", on("2026-09-30"))
        yield* make("Gift", on("2026-10-05"), "for the dentist's kid")
        yield* make("Someday", null)
        return {
          week: yield* s.between(CalendarDate.make("2026-09-28"), CalendarDate.make("2026-10-04")),
          hits: yield* s.search("DENTIST")
        }
      })
    )
    expect(result.week.map((d) => [d.date, d.tasks.map((t) => t.title)])).toEqual([["2026-09-30", ["Dentist"]]])
    expect(result.hits.map((t) => t.title)).toEqual(["Dentist", "Gift"])
  })

  it("reports a missing task or subtask as a typed error", async () => {
    const errors = await run(
      Effect.gen(function* () {
        const s = yield* TaskService
        const task = yield* s.create({ listId: inbox.id, title: "x", notes: "", due: null, priority: "none", flagged: false, recurrence: null })
        return [
          (yield* failure(s.get(TaskId.make("missing"))))._tag,
          (yield* failure(s.toggleSubtask(task.id, "nope" as never)))._tag
        ]
      })
    )
    expect(errors).toEqual(["TaskNotFound", "SubtaskNotFound"])
  })
})
