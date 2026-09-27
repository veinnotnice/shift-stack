// Business logic for tasks: what each screen shows, and every change a task can go through.
import { Clock, Effect, Schema } from "effect"
import { ListRepository } from "@testin/data/ListRepository"
import { TaskRepository } from "@testin/data/TaskRepository"
import { type CalendarDate } from "@testin/domain/calendar"
import { SubtaskNotFound } from "@testin/domain/errors"
import { ListId } from "@testin/domain/list"
import { nextOccurrence, Recurrence } from "@testin/domain/recurrence"
import { belongsTo, byCompletion, byDue, byPosition, groupByDay, sortFor, type SmartList } from "@testin/domain/schedule"
import { Due, isOpen, Priority, TaskTitle, type SubtaskId, type Task, type TaskId } from "@testin/domain/task"
import { newSubtaskId, newTaskId, nextPosition, reorderBy } from "./ids.ts"
import { today } from "./today.ts"

/** What it takes to create a task. The http layer decodes requests into this. */
export const NewTask = Schema.Struct({
  listId: ListId,
  title: TaskTitle,
  notes: Schema.optionalWith(Schema.String, { default: () => "" }),
  due: Schema.optionalWith(Schema.NullOr(Due), { default: () => null }),
  priority: Schema.optionalWith(Priority, { default: () => "none" as const }),
  flagged: Schema.optionalWith(Schema.Boolean, { default: () => false }),
  recurrence: Schema.optionalWith(Schema.NullOr(Recurrence), { default: () => null })
})
export type NewTask = typeof NewTask.Type

/** Any subset of a task's editable fields. */
export const TaskChanges = Schema.partial(
  Schema.Struct({
    listId: ListId,
    title: TaskTitle,
    notes: Schema.String,
    due: Schema.NullOr(Due),
    priority: Priority,
    flagged: Schema.Boolean,
    recurrence: Schema.NullOr(Recurrence)
  })
)
export type TaskChanges = typeof TaskChanges.Type

/** Completing a repeating task keeps a completed copy and moves the task itself on to its next date. */
export interface Completion {
  readonly completed: Task
  /** The task, moved on to its next date; only for repeating tasks. */
  readonly next: Task | null
}

export class TaskService extends Effect.Service<TaskService>()("TaskService", {
  effect: Effect.gen(function* () {
    const tasks = yield* TaskRepository
    const lists = yield* ListRepository

    // A repeating task needs a date to repeat from: without one, it starts today.
    const withDateForRecurrence = (task: Task) =>
      Effect.map(today, (day): Task => (task.recurrence && !task.due ? { ...task, due: { date: day, time: null } } : task))

    // ── What the screens show ──────────────────────────────────────────────────────────────────────

    const smart = (list: SmartList) =>
      Effect.gen(function* () {
        const [everything, day] = yield* Effect.all([tasks.all, today])
        return everything.filter(belongsTo(list, day)).sort(sortFor(list))
      })

    /** A list's tasks: the open ones in the user's order, the completed ones newest first. */
    const inList = (listId: ListId) =>
      Effect.gen(function* () {
        const list = yield* lists.get(listId)
        const own = yield* tasks.inList(listId)
        return {
          list,
          open: own.filter(isOpen).sort(byPosition),
          completed: own.filter((task) => !isOpen(task)).sort(byCompletion)
        }
      })

    /** Open tasks due between two days (both included), grouped by day: the calendar. */
    const between = (from: CalendarDate, to: CalendarDate) =>
      Effect.map(tasks.all, (everything) =>
        groupByDay(everything.filter((task) => isOpen(task) && task.due !== null && task.due.date >= from && task.due.date <= to))
      )

    /** Titles and notes containing the query, open tasks first. */
    const search = (query: string) =>
      Effect.map(tasks.all, (everything) => {
        const needle = query.trim().toLocaleLowerCase()
        if (!needle) return []
        const hits = everything.filter((task) => `${task.title}\n${task.notes}`.toLocaleLowerCase().includes(needle))
        return [...hits.filter(isOpen).sort(byDue), ...hits.filter((task) => !isOpen(task)).sort(byCompletion)]
      })

    // ── Changes ────────────────────────────────────────────────────────────────────────────────────

    const create = (input: NewTask) =>
      Effect.gen(function* () {
        yield* lists.get(input.listId)
        const task = yield* withDateForRecurrence({
          ...input,
          id: yield* newTaskId,
          subtasks: [],
          position: nextPosition(yield* tasks.inList(input.listId)),
          createdAt: yield* Clock.currentTimeMillis,
          completedAt: null
        })
        yield* tasks.save(task)
        return task
      })

    const update = (id: TaskId, changes: TaskChanges) =>
      Effect.gen(function* () {
        const task = yield* tasks.get(id)
        // Moving to another list puts the task at its end.
        const moved =
          changes.listId && changes.listId !== task.listId
            ? { position: nextPosition(yield* tasks.inList((yield* lists.get(changes.listId)).id)) }
            : {}
        const next = yield* withDateForRecurrence({ ...task, ...changes, ...moved })
        yield* tasks.save(next)
        return next
      })

    const complete = (id: TaskId) =>
      Effect.gen(function* () {
        const task = yield* tasks.get(id)
        const now = yield* Clock.currentTimeMillis
        if (!isOpen(task)) return { completed: task, next: null } satisfies Completion
        if (!task.recurrence) {
          const completed = { ...task, completedAt: now }
          yield* tasks.save(completed)
          return { completed, next: null } satisfies Completion
        }
        const from = task.due?.date ?? (yield* today)
        const completed: Task = { ...task, id: yield* newTaskId, recurrence: null, completedAt: now }
        const next: Task = {
          ...task,
          due: { date: nextOccurrence(task.recurrence, from), time: task.due?.time ?? null },
          subtasks: task.subtasks.map((subtask) => ({ ...subtask, done: false }))
        }
        yield* tasks.saveAll([completed, next])
        return { completed, next } satisfies Completion
      })

    /** Takes a completion back: reopens the task, or for a repeating one, returns it to where it was. */
    const undoCompletion = (completion: { completedId: TaskId; nextId: TaskId | null }) =>
      Effect.gen(function* () {
        const completed = yield* tasks.get(completion.completedId)
        if (completion.nextId === null) {
          const reopened = { ...completed, completedAt: null }
          yield* tasks.save(reopened)
          return reopened
        }
        const next = yield* tasks.get(completion.nextId)
        const restored = { ...next, due: completed.due, subtasks: completed.subtasks }
        yield* tasks.save(restored)
        yield* tasks.remove(completed.id)
        return restored
      })

    const reopen = (id: TaskId) => Effect.flatMap(tasks.get(id), (task) => saveReturning({ ...task, completedAt: null }))

    const toggleFlag = (id: TaskId) => Effect.flatMap(tasks.get(id), (task) => saveReturning({ ...task, flagged: !task.flagged }))

    const remove = tasks.remove

    /** The open tasks of a list, in a new order. */
    const reorder = (listId: ListId, order: ReadonlyArray<TaskId>) =>
      Effect.gen(function* () {
        yield* lists.get(listId)
        yield* tasks.saveAll(reorderBy((yield* tasks.inList(listId)).filter(isOpen), order))
      })

    // ── Subtasks ───────────────────────────────────────────────────────────────────────────────────

    const addSubtask = (id: TaskId, title: typeof TaskTitle.Type) =>
      Effect.gen(function* () {
        const task = yield* tasks.get(id)
        return yield* saveReturning({ ...task, subtasks: [...task.subtasks, { id: yield* newSubtaskId, title, done: false }] })
      })

    const changeSubtask = (id: TaskId, subtaskId: SubtaskId, change: (subtasks: Task["subtasks"]) => Task["subtasks"]) =>
      Effect.gen(function* () {
        const task = yield* tasks.get(id)
        if (!task.subtasks.some((subtask) => subtask.id === subtaskId)) return yield* new SubtaskNotFound({ taskId: id, id: subtaskId })
        return yield* saveReturning({ ...task, subtasks: change(task.subtasks) })
      })

    const toggleSubtask = (id: TaskId, subtaskId: SubtaskId) =>
      changeSubtask(id, subtaskId, (subtasks) => subtasks.map((s) => (s.id === subtaskId ? { ...s, done: !s.done } : s)))

    const removeSubtask = (id: TaskId, subtaskId: SubtaskId) =>
      changeSubtask(id, subtaskId, (subtasks) => subtasks.filter((s) => s.id !== subtaskId))

    const saveReturning = (task: Task) => Effect.as(tasks.save(task), task)

    return {
      get: tasks.get,
      smart,
      inList,
      between,
      search,
      create,
      update,
      complete,
      undoCompletion,
      reopen,
      toggleFlag,
      remove,
      reorder,
      addSubtask,
      toggleSubtask,
      removeSubtask
    } as const
  })
}) {}
