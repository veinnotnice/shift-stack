// The Calendar screen: a month with a mark on every day that has tasks, and the chosen day's tasks below.
import { HttpRouter, HttpServerRequest, HttpServerResponse } from "@effect/platform"
import { Effect, Option, Schema } from "effect"
import { addDays, CalendarDate, startOfMonth, startOfWeek } from "@todos/domain/calendar"
import type { ListColor } from "@todos/domain/list"
import { page } from "#backend/rendering/respond.ts"
import { ListService } from "@todos/services/ListService"
import { TaskService } from "@todos/services/TaskService"
import { today } from "@todos/services/today"
import { href } from "@shift-stack/core/server"

// The month grid shows six weeks from the Monday before the 1st.
const gridDays = 42

export const calendarRoutes = HttpRouter.empty.pipe(
  HttpRouter.get(
    "/calendar",
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest
      const query = yield* HttpServerRequest.schemaSearchParams(Schema.Struct({ day: Schema.optional(Schema.String) }))
      const now = yield* today
      // A missing or malformed day means today.
      const day = Option.getOrElse(Schema.decodeUnknownOption(CalendarDate)(query.day), () => now)

      const first = startOfWeek(startOfMonth(day))
      const days = yield* Effect.flatMap(TaskService, (tasks) => tasks.between(first, addDays(first, gridDays - 1)))
      const lists = yield* Effect.flatMap(ListService, (service) => service.all)
      const colorOf = new Map(lists.map((list) => [list.id, list.color]))
      // Up to three dots per day, one per list colour.
      const marks: Record<string, ListColor[]> = Object.fromEntries(
        days.map(({ date, tasks }) => [date, [...new Set(tasks.map((task) => colorOf.get(task.listId)!))].slice(0, 3)])
      )

      const response = yield* page("calendar", {
        today: now,
        day,
        marks,
        tasks: days.find((entry) => entry.date === day)?.tasks ?? [],
        lists
      })
      // Picking a day swaps the page through HTMX; keep the address bar on that day, so Back and reload work.
      if (request.headers["hx-request"] !== "true") return response
      return HttpServerResponse.setHeader(response, "HX-Push-Url", yield* href(`/calendar?day=${day}`))
    })
  )
)
