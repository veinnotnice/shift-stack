import { Effect } from "effect"
import { describe, expect, it } from "vitest"
import { CalendarDate } from "@testin/domain/calendar"
import { ListService } from "@testin/services/ListService"
import { TaskService } from "@testin/services/TaskService"
import { failure, inbox, run, work } from "./harness.ts"

describe("ListService", () => {
  it("creates lists at the end and reorders them", async () => {
    const names = await run(
      Effect.gen(function* () {
        const lists = yield* ListService
        const home = yield* lists.create({ name: "Home", color: "green", icon: "house" })
        yield* lists.reorder([home.id, inbox.id])
        return (yield* lists.all).map((l) => l.name)
      })
    )
    expect(names).toEqual(["Home", "Inbox", "Work"])
  })

  it("counts smart lists and open and overdue tasks per list", async () => {
    const overview = await run(
      Effect.gen(function* () {
        const tasks = yield* TaskService
        const make = (listId: typeof inbox.id, due: string | null) =>
          tasks.create({
            listId,
            title: "t",
            notes: "",
            due: due === null ? null : { date: CalendarDate.make(due), time: null },
            priority: "none",
            flagged: false,
            recurrence: null
          })
        yield* make(inbox.id, "2026-09-27")
        yield* make(inbox.id, "2026-09-28")
        const done = yield* make(work.id, null)
        yield* tasks.complete(done.id)
        return yield* Effect.flatMap(ListService, (l) => l.overview)
      })
    )
    expect(overview.smart).toEqual({ today: 2, scheduled: 2, all: 2, flagged: 0, completed: 1 })
    expect(overview.lists.map((s) => [s.list.name, s.open, s.overdue])).toEqual([
      ["Inbox", 2, 1],
      ["Work", 0, 0]
    ])
  })

  it("deletes a list with its tasks, but never the last one", async () => {
    const result = await run(
      Effect.gen(function* () {
        const lists = yield* ListService
        const tasks = yield* TaskService
        yield* tasks.create({ listId: work.id, title: "Gone", notes: "", due: null, priority: "none", flagged: false, recurrence: null })
        yield* lists.remove(work.id)
        return {
          remaining: (yield* lists.all).map((l) => l.name),
          all: yield* tasks.smart("all"),
          last: (yield* failure(lists.remove(inbox.id)))._tag
        }
      })
    )
    expect(result.remaining).toEqual(["Inbox"])
    expect(result.all).toHaveLength(0)
    expect(result.last).toBe("LastListRemaining")
  })
})
