// Settings the user changes in the settings sheet.
import { HttpRouter, HttpServerRequest, HttpServerResponse } from "@effect/platform"
import { Effect, Schema } from "effect"
import { htmlResponse, trigger } from "@shift-stack/core/server"
import { fragment } from "#backend/rendering/respond.ts"
import { themeCookie, toTheme } from "#shared/theme.ts"

export const settingsRoutes = HttpRouter.empty.pipe(
  // The theme: kept in a cookie (read by http/theme.ts on every request). Answers with the form as it now stands and
  // a `theme` event, on which the page applies it (islands/entry.ts).
  HttpRouter.post(
    "/settings/theme",
    Effect.gen(function* () {
      const body = yield* HttpServerRequest.schemaBodyUrlParams(Schema.Struct({ theme: Schema.String }))
      const theme = toTheme(body.theme)
      const form = yield* fragment("themeForm", { theme })
      return htmlResponse(form).pipe(
        HttpServerResponse.unsafeSetCookie(themeCookie, theme, { path: "/", maxAge: "365 days", sameSite: "lax" }),
        trigger({ theme: { theme } })
      )
    })
  )
)
