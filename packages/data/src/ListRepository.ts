// Data layer: where task lists are kept. Only the interface lives here; infrastructure/ implements it.
import { Context, type Effect } from "effect"
import type { ListNotFound } from "@todos/domain/errors"
import type { ListId, TaskList } from "@todos/domain/list"

export class ListRepository extends Context.Tag("ListRepository")<
  ListRepository,
  {
    readonly all: Effect.Effect<ReadonlyArray<TaskList>>
    readonly get: (id: ListId) => Effect.Effect<TaskList, ListNotFound>
    /** Inserts or replaces, by id. */
    readonly save: (list: TaskList) => Effect.Effect<void>
    /** Several at once, as one change (reordering). */
    readonly saveAll: (lists: ReadonlyArray<TaskList>) => Effect.Effect<void>
    readonly remove: (id: ListId) => Effect.Effect<void, ListNotFound>
  }
>() {}
