// Every route of the app, written without the locale prefix: app.ts strips it and provides the request context.
import { HttpRouter } from "@effect/platform"
import { calendarRoutes } from "./calendar.ts"
import { listRoutes } from "./lists.ts"
import { settingsRoutes } from "./settings.ts"
import { taskRoutes } from "./tasks.ts"
import { todayRoutes } from "./today.ts"

export const routes = HttpRouter.concatAll(todayRoutes, calendarRoutes, listRoutes, taskRoutes, settingsRoutes)
