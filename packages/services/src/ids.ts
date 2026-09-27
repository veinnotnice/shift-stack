// New ids for the things the services create.
import { Effect } from "effect"
import { ListId } from "@todos/domain/list"
import { SubtaskId, TaskId } from "@todos/domain/task"

export const newTaskId = Effect.sync(() => TaskId.make(crypto.randomUUID()))
export const newSubtaskId = Effect.sync(() => SubtaskId.make(crypto.randomUUID()))
export const newListId = Effect.sync(() => ListId.make(crypto.randomUUID()))

/** The position after the last item: where something new goes. */
export const nextPosition = (items: ReadonlyArray<{ readonly position: number }>): number =>
  items.reduce((max, item) => Math.max(max, item.position + 1), 0)

/** Positions 0, 1, 2 … in the given order; ids not mentioned keep their order after them. */
export const reorderBy = <Id, A extends { readonly id: Id; readonly position: number }>(
  items: ReadonlyArray<A>,
  order: ReadonlyArray<Id>
): A[] => {
  const rank = new Map(order.map((id, index) => [id, index]))
  return [...items]
    .sort((a, b) => (rank.get(a.id) ?? order.length + a.position) - (rank.get(b.id) ?? order.length + b.position))
    .map((item, position) => ({ ...item, position }))
}
