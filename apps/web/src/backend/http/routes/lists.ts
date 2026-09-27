// The Lists screen, one list, the smart lists, and adding lists and tasks.
import { HttpRouter, HttpServerRequest, HttpServerResponse } from "@effect/platform"
import { Effect, Option, Schema } from "effect"
import { ListColor, ListIcon, ListId } from "@todos/domain/list"
import { TaskTitle } from "@todos/domain/task"
import { htmlResponse, navigateTo } from "@shift-stack/core/server"
import { fragment, page } from "#backend/rendering/respond.ts"
import { ListService, NewList } from "@todos/services/ListService"
import { TaskService } from "@todos/services/TaskService"
import { today } from "@todos/services/today"

const ListParams = Schema.Struct({ listId: ListId })
// Today has its own screen at "/".
const SmartParams = Schema.Struct({ kind: Schema.Literal("scheduled", "all", "flagged", "completed") })
// What the New List form sends, before it is checked.
const NewListForm = Schema.Struct({ name: Schema.String, color: Schema.String, icon: Schema.String })

export const listRoutes = HttpRouter.empty.pipe(
  HttpRouter.get(
    "/lists",
    Effect.gen(function* () {
      const lists = yield* ListService
      return yield* page("lists", { overview: yield* lists.overview })
    })
  ),

  HttpRouter.get(
    "/lists/:listId",
    Effect.gen(function* () {
      const { listId } = yield* HttpRouter.schemaPathParams(ListParams)
      const { list, open, completed } = yield* Effect.flatMap(TaskService, (tasks) => tasks.inList(listId))
      return yield* page("list", { list, open, completed, today: yield* today })
    })
  ),

  HttpRouter.get(
    "/smart/:kind",
    Effect.gen(function* () {
      const { kind } = yield* HttpRouter.schemaPathParams(SmartParams)
      const tasks = yield* Effect.flatMap(TaskService, (service) => service.smart(kind))
      return yield* page("smart", {
        kind,
        tasks,
        lists: yield* Effect.flatMap(ListService, (lists) => lists.all),
        today: yield* today
      })
    })
  ),

  // The New List sheet's form. Accepted: the app goes to the new list (and the sheet closes). Not: the form comes
  // back with what was entered and why it was not accepted, and the sheet stays open.
  HttpRouter.post(
    "/lists",
    Effect.gen(function* () {
      const body = yield* HttpServerRequest.schemaBodyUrlParams(NewListForm)
      const input = Schema.decodeUnknownOption(NewList)(body)
      if (input._tag === "None") {
        const color = Schema.decodeUnknownOption(ListColor)(body.color)
        const icon = Schema.decodeUnknownOption(ListIcon)(body.icon)
        const form = yield* fragment("newListForm", {
          name: body.name,
          color: Option.getOrUndefined(color),
          icon: Option.getOrUndefined(icon),
          invalid: true
        })
        return htmlResponse(form, 422)
      }
      const list = yield* Effect.flatMap(ListService, (lists) => lists.create(input.value))
      return yield* navigateTo(`/lists/${list.id}`)
    })
  ),

  // The inline "New task" row at the end of a list: answers with the new row, appended by HTMX.
  HttpRouter.post(
    "/lists/:listId/tasks",
    Effect.gen(function* () {
      const { listId } = yield* HttpRouter.schemaPathParams(ListParams)
      const body = yield* HttpServerRequest.schemaBodyUrlParams(Schema.Struct({ title: Schema.String }))
      const title = Schema.decodeUnknownOption(TaskTitle)(body.title)
      if (title._tag === "None") return HttpServerResponse.empty({ status: 204 })
      const tasks = yield* TaskService
      const task = yield* tasks.create({
        listId,
        title: title.value,
        notes: "",
        due: null,
        priority: "none",
        flagged: false,
        recurrence: null
      })
      const list = yield* Effect.flatMap(ListService, (lists) => lists.get(listId))
      return htmlResponse(yield* fragment("taskRow", { task, list, today: yield* today, showList: false }))
    })
  )
)
