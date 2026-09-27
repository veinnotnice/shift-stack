// Business logic for task lists: create, change, delete and order them, and the counts the Lists screen shows.
import { Effect, Schema } from "effect"
import { ListRepository } from "@todos/data/ListRepository"
import { TaskRepository } from "@todos/data/TaskRepository"
import { LastListRemaining } from "@todos/domain/errors"
import { ListColor, ListIcon, ListName, type ListId, type TaskList } from "@todos/domain/list"
import { countSmartLists, isOverdue, type SmartList } from "@todos/domain/schedule"
import { isOpen } from "@todos/domain/task"
import { newListId, nextPosition, reorderBy } from "./ids.ts"
import { today } from "./today.ts"

/** What it takes to create a list. The http layer decodes requests into this. */
export const NewList = Schema.Struct({ name: ListName, color: ListColor, icon: ListIcon })
export type NewList = typeof NewList.Type

export const ListChanges = Schema.partial(NewList)
export type ListChanges = typeof ListChanges.Type

export interface ListSummary {
  readonly list: TaskList
  readonly open: number
  readonly overdue: number
}

export interface Overview {
  readonly smart: Record<SmartList, number>
  readonly lists: ReadonlyArray<ListSummary>
}

export class ListService extends Effect.Service<ListService>()("ListService", {
  effect: Effect.gen(function* () {
    const lists = yield* ListRepository
    const tasks = yield* TaskRepository

    const all = Effect.map(lists.all, (items) => [...items].sort((a, b) => a.position - b.position))

    /** The smart lists' counts and every list with its open and overdue tasks. */
    const overview = Effect.gen(function* () {
      const [ordered, everything, day] = yield* Effect.all([all, tasks.all, today])
      return {
        smart: countSmartLists(everything, day),
        lists: ordered.map((list) => {
          const own = everything.filter((task) => task.listId === list.id)
          return {
            list,
            open: own.filter(isOpen).length,
            overdue: own.filter((task) => isOverdue(task, day)).length
          }
        })
      } satisfies Overview
    })

    const create = (input: NewList) =>
      Effect.gen(function* () {
        const list: TaskList = { id: yield* newListId, ...input, position: nextPosition(yield* lists.all) }
        yield* lists.save(list)
        return list
      })

    const update = (id: ListId, changes: ListChanges) =>
      Effect.gen(function* () {
        const list = { ...(yield* lists.get(id)), ...changes }
        yield* lists.save(list)
        return list
      })

    /** Deletes the list and its tasks. The last list stays: every task needs one. */
    const remove = (id: ListId) =>
      Effect.gen(function* () {
        yield* lists.get(id)
        if ((yield* lists.all).length <= 1) return yield* new LastListRemaining({ id })
        yield* lists.remove(id)
        yield* tasks.removeInList(id)
      })

    const reorder = (order: ReadonlyArray<ListId>) => Effect.flatMap(lists.all, (items) => lists.saveAll(reorderBy(items, order)))

    return { all, get: lists.get, overview, create, update, remove, reorder } as const
  })
}) {}
