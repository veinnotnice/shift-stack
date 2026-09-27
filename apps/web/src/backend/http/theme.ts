// The theme the settings sheet chose, from its cookie, handed to the views (frontend/views/theme.ts).
import { HttpServerRequest } from "@effect/platform"
import { Effect } from "effect"
import { withViewData, type ServerPlugin } from "@shift-stack/core/server"
import { themeCookie, toTheme } from "#shared/theme.ts"

export const theme: ServerPlugin = (app) =>
  Effect.flatMap(HttpServerRequest.HttpServerRequest, (request) =>
    app.pipe(withViewData({ theme: toTheme(request.cookies[themeCookie]) }))
  )
