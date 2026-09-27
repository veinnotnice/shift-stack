// A keyed collection in a Ref: what both in-memory repositories are built on.
import { Effect, Ref } from "effect"

export const makeStore = <Id extends string, A extends { readonly id: Id }, E>(
  initial: ReadonlyArray<A>,
  notFound: (id: Id) => E
) =>
  Effect.map(Ref.make(new Map(initial.map((item) => [item.id, item] as const))), (ref) => {
    const values = Effect.map(Ref.get(ref), (map) => [...map.values()])
    return {
      values,
      get: (id: Id) =>
        Effect.flatMap(Ref.get(ref), (map) => {
          const item = map.get(id)
          return item === undefined ? Effect.fail(notFound(id)) : Effect.succeed(item)
        }),
      saveAll: (items: ReadonlyArray<A>) =>
        Ref.update(ref, (map) => {
          const next = new Map(map)
          for (const item of items) next.set(item.id, item)
          return next
        }),
      remove: (id: Id) =>
        Ref.modify(ref, (map): readonly [boolean, Map<Id, A>] => {
          if (!map.has(id)) return [false, map]
          const next = new Map(map)
          next.delete(id)
          return [true, next]
        }).pipe(Effect.flatMap((removed) => (removed ? Effect.void : Effect.fail(notFound(id))))),
      removeWhere: (predicate: (item: A) => boolean) =>
        Ref.update(ref, (map) => new Map([...map].filter(([, item]) => !predicate(item))))
    }
  })
