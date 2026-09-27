// A task and its parts. Plain data (no classes, no Date objects), so it crosses into views and islands as is.
import { Schema } from "effect"
import { CalendarDate, TimeOfDay } from "./calendar.ts"
import { ListId } from "./list.ts"
import { Recurrence } from "./recurrence.ts"

export const TaskId = Schema.String.pipe(Schema.brand("TaskId"))
export type TaskId = typeof TaskId.Type

export const SubtaskId = Schema.String.pipe(Schema.brand("SubtaskId"))
export type SubtaskId = typeof SubtaskId.Type

export const priorities = ["none", "low", "medium", "high"] as const
export const Priority = Schema.Literal(...priorities)
export type Priority = typeof Priority.Type

export const TaskTitle = Schema.Trim.pipe(Schema.minLength(1), Schema.maxLength(200))

/** A due day, optionally at a time. No time means "some time that day". */
export const Due = Schema.Struct({ date: CalendarDate, time: Schema.NullOr(TimeOfDay) })
export type Due = typeof Due.Type

export const Subtask = Schema.Struct({ id: SubtaskId, title: TaskTitle, done: Schema.Boolean })
export type Subtask = typeof Subtask.Type

export const Task = Schema.Struct({
  id: TaskId,
  listId: ListId,
  title: TaskTitle,
  notes: Schema.String,
  due: Schema.NullOr(Due),
  priority: Priority,
  flagged: Schema.Boolean,
  recurrence: Schema.NullOr(Recurrence),
  subtasks: Schema.Array(Subtask),
  /** Order inside its list, ascending. */
  position: Schema.Number,
  /** Epoch milliseconds. */
  createdAt: Schema.Number,
  /** Epoch milliseconds; null while open. */
  completedAt: Schema.NullOr(Schema.Number)
})
export type Task = typeof Task.Type

export const isOpen = (task: Task): boolean => task.completedAt === null

export const priorityRank: Record<Priority, number> = { high: 3, medium: 2, low: 1, none: 0 }
