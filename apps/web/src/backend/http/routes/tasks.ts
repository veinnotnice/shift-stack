// Changing one task from its row: complete (with undo), reopen, flag, delete. A task that no longer belongs where
// its row is (completed, reopened) leaves at once: the answer replaces the row with nothing.
import { HttpRouter, HttpServerRequest, HttpServerResponse } from "@effect/platform"
import { Effect, Schema } from "effect"
import { TaskId, type Task } from "@testin/domain/task"
import { href, htmlResponse, refresh } from "@shift-stack/core/server"
import { fragment } from "#backend/rendering/respond.ts"
import { ListService } from "@testin/services/ListService"
import { TaskService } from "@testin/services/TaskService"
import { today } from "@testin/services/today"
import { m } from "#shared/paraglide/messages.js"
import { locale as requestLocale } from "#backend/http/i18n.ts"
import { withToast } from "#backend/http/respond.ts"

const TaskParams = Schema.Struct({ taskId: TaskId })
// Rows on smart lists and Today show which list a task is in; rows inside a list don't.
const RowContext = Schema.Struct({ in: Schema.optionalWith(Schema.Literal("list", "smart"), { default: () => "list" as const }) })

/** The task's row again, as it looks now. */
const row = (task: Task) =>
  Effect.gen(function* () {
    const context = yield* HttpServerRequest.schemaSearchParams(RowContext)
    const list = yield* Effect.flatMap(ListService, (lists) => lists.get(task.listId))
    return htmlResponse(yield* fragment("taskRow", { task, list, today: yield* today, showList: context.in === "smart" }))
  })

const taskParam = Effect.map(HttpRouter.schemaPathParams(TaskParams), (params) => params.taskId)

/** On a list's own page, its open and completed sections, fresh, to send along out of band. */
const listSections = (task: Task, parts: { open: boolean; done: boolean }) =>
  Effect.gen(function* () {
    const context = yield* HttpServerRequest.schemaSearchParams(RowContext)
    if (context.in !== "list") return ""
    const { list, open, completed } = yield* Effect.flatMap(TaskService, (tasks) => tasks.inList(task.listId))
    const day = yield* today
    const openHtml = parts.open ? yield* fragment("openTasks", { list, open, today: day, oob: true }) : ""
    const doneHtml = parts.done ? yield* fragment("doneTasks", { list, completed, today: day, oob: true }) : ""
    return openHtml + doneHtml
  })

export const taskRoutes = HttpRouter.empty.pipe(
  HttpRouter.post(
    "/tasks/:taskId/complete",
    Effect.gen(function* () {
      const tasks = yield* TaskService
      const { completed, next } = yield* tasks.complete(yield* taskParam)
      const locale = yield* requestLocale
      const undo = yield* href(`/tasks/${completed.id}/undo${next ? `?next=${next.id}` : ""}`)
      // The row goes at once: the answer replaces it with nothing, plus the list's Completed section.
      const html = yield* listSections(completed, { open: false, done: true })
      return htmlResponse(html).pipe(
        withToast({
          message: m.task_completed({ title: completed.title }, { locale }),
          action: { label: m.undo({}, { locale }), url: undo }
        })
      )
    })
  ),

  HttpRouter.post(
    "/tasks/:taskId/undo",
    Effect.gen(function* () {
      // The path names the completed task; `next` is set when it was a repeating one that moved on.
      const completedId = yield* taskParam
      const { next } = yield* HttpServerRequest.schemaSearchParams(Schema.Struct({ next: Schema.optional(TaskId) }))
      yield* Effect.flatMap(TaskService, (tasks) => tasks.undoCompletion({ completedId, nextId: next ?? null }))
      return refresh
    })
  ),

  HttpRouter.post(
    "/tasks/:taskId/reopen",
    Effect.gen(function* () {
      const task = yield* Effect.flatMap(TaskService, (tasks) => Effect.flatMap(taskParam, tasks.reopen))
      const sections = yield* listSections(task, { open: true, done: true })
      return htmlResponse(sections)
    })
  ),

  HttpRouter.post(
    "/tasks/:taskId/flag",
    Effect.flatMap(taskParam, (id) => Effect.flatMap(TaskService, (tasks) => Effect.flatMap(tasks.toggleFlag(id), (task) => row(task))))
  ),

  HttpRouter.post(
    "/tasks/:taskId/delete",
    Effect.gen(function* () {
      yield* Effect.flatMap(TaskService, (tasks) => Effect.flatMap(taskParam, tasks.remove))
      return HttpServerResponse.text("")
    })
  )
)
