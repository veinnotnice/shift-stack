// The Today screen: what is overdue, then what is due today.
import { HttpRouter } from "@effect/platform"
import { Effect } from "effect"
import { isOverdue } from "@testin/domain/schedule"
import { page } from "#backend/rendering/respond.ts"
import { ListService } from "@testin/services/ListService"
import { TaskService } from "@testin/services/TaskService"
import { today } from "@testin/services/today"

export const todayRoutes = HttpRouter.empty.pipe(
  HttpRouter.get(
    "/",
    Effect.gen(function* () {
      const tasks = yield* TaskService
      const day = yield* today
      const due = yield* tasks.smart("today")
      return yield* page("today", {
        today: day,
        overdue: due.filter((task) => isOverdue(task, day)),
        dueToday: due.filter((task) => !isOverdue(task, day)),
        lists: yield* Effect.flatMap(ListService, (lists) => lists.all)
      })
    })
  )
)
