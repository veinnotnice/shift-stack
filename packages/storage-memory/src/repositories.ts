// The data layer's interfaces, implemented in memory. Everything is lost when the process stops.
import { Effect, Layer } from "effect"
import { ListRepository } from "@testin/data/ListRepository"
import { TaskRepository } from "@testin/data/TaskRepository"
import { ListNotFound, TaskNotFound } from "@testin/domain/errors"
import type { TaskList } from "@testin/domain/list"
import type { Task } from "@testin/domain/task"
import { makeStore } from "./store.ts"

export const TaskRepositoryMemory = (initial: ReadonlyArray<Task> = []) =>
  Layer.effect(
    TaskRepository,
    Effect.map(makeStore(initial, (id: Task["id"]) => new TaskNotFound({ id })), (store) =>
      TaskRepository.of({
        all: store.values,
        inList: (listId) => Effect.map(store.values, (tasks) => tasks.filter((task) => task.listId === listId)),
        get: store.get,
        save: (task) => store.saveAll([task]),
        saveAll: store.saveAll,
        remove: store.remove,
        removeInList: (listId) => store.removeWhere((task) => task.listId === listId)
      })
    )
  )

export const ListRepositoryMemory = (initial: ReadonlyArray<TaskList> = []) =>
  Layer.effect(
    ListRepository,
    Effect.map(makeStore(initial, (id: TaskList["id"]) => new ListNotFound({ id })), (store) =>
      ListRepository.of({
        all: store.values,
        get: store.get,
        save: (list) => store.saveAll([list]),
        saveAll: store.saveAll,
        remove: store.remove
      })
    )
  )
