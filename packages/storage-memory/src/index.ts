// In-memory storage for the whole app, filled with the seed data. What main/ provides until there is a database.
import { Clock, Config, Effect, Layer } from "effect"
import { calendarDateAt } from "@todos/domain/calendar"
import { ListRepositoryMemory, TaskRepositoryMemory } from "./repositories.ts"
import { seed } from "./seed.ts"

export { ListRepositoryMemory, TaskRepositoryMemory } from "./repositories.ts"

export const MemoryStorage = Layer.unwrapEffect(
  Effect.gen(function* () {
    const now = yield* Clock.currentTimeMillis
    const zone = yield* Config.string("DEFAULT_TIME_ZONE").pipe(Config.withDefault("Europe/Berlin"))
    const { lists, tasks } = seed(calendarDateAt(now, zone), now)
    return Layer.merge(ListRepositoryMemory(lists), TaskRepositoryMemory(tasks))
  })
)
