// Data layer: where tasks are kept. Only the interface lives here; infrastructure/ implements it.
import { Context, type Effect } from "effect"
import type { TaskNotFound } from "@todos/domain/errors"
import type { ListId } from "@todos/domain/list"
import type { Task, TaskId } from "@todos/domain/task"

export class TaskRepository extends Context.Tag("TaskRepository")<
  TaskRepository,
  {
    readonly all: Effect.Effect<ReadonlyArray<Task>>
    readonly inList: (listId: ListId) => Effect.Effect<ReadonlyArray<Task>>
    readonly get: (id: TaskId) => Effect.Effect<Task, TaskNotFound>
    /** Inserts or replaces, by id. */
    readonly save: (task: Task) => Effect.Effect<void>
    /** Several at once, as one change (reordering). */
    readonly saveAll: (tasks: ReadonlyArray<Task>) => Effect.Effect<void>
    readonly remove: (id: TaskId) => Effect.Effect<void, TaskNotFound>
    readonly removeInList: (listId: ListId) => Effect.Effect<void>
  }
>() {}
