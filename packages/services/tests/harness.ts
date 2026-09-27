// Runs service code the way the app does, but on empty (or given) in-memory storage and a fixed clock:
// Monday, 28 September 2026, 12:00 in Berlin.
import { Effect, Layer, TestClock, TestContext } from "effect"
import { ListId, type TaskList } from "@testin/domain/list"
import type { Task } from "@testin/domain/task"
import { ListRepositoryMemory, TaskRepositoryMemory } from "@testin/storage-memory"
import { ListService } from "@testin/services/ListService"
import { TaskService } from "@testin/services/TaskService"
import { TimeZone } from "@testin/services/today"

export const now = Date.UTC(2026, 8, 28, 10, 0)

export const inbox: TaskList = { id: ListId.make("inbox"), name: "Inbox", color: "blue", icon: "list", position: 0 }
export const work: TaskList = { id: ListId.make("work"), name: "Work", color: "orange", icon: "briefcase", position: 1 }

export const run = <A, E>(
  effect: Effect.Effect<A, E, TaskService | ListService | TimeZone>,
  storage: { lists?: ReadonlyArray<TaskList>; tasks?: ReadonlyArray<Task> } = {}
): Promise<A> =>
  Effect.gen(function* () {
    yield* TestClock.setTime(now)
    return yield* effect
  }).pipe(
    Effect.provide(
      Layer.mergeAll(TaskService.Default, ListService.Default).pipe(
        Layer.provide(Layer.merge(ListRepositoryMemory(storage.lists ?? [inbox, work]), TaskRepositoryMemory(storage.tasks ?? [])))
      )
    ),
    Effect.provideService(TimeZone, "Europe/Berlin"),
    Effect.provide(TestContext.TestContext),
    Effect.runPromise
  )

/** The error a failing effect fails with, as a value. */
export const failure = <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.flip(effect)
