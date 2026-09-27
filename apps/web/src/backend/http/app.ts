// The whole HTTP app: the routes, wrapped from the inside out in the error pages, the theme, the locale prefix
// and the built browser files. The locale is outside the error pages, so they are translated too.
import { Data, Effect, Predicate } from "effect"
import { clientAssets, errorPages } from "@shift-stack/core/server"
import { page } from "#backend/rendering/respond.ts"
import { frontend } from "#frontend/config.ts"
import { TimeZone } from "@todos/services/today"
import { i18n } from "./i18n.ts"
import { routes } from "./routes/index.ts"
import { theme } from "./theme.ts"
import { requestTimeZone } from "./time-zone.ts"

/** Fail a route with this to answer with the translated 404 page. */
export class NotFound extends Data.TaggedError("NotFound") {}

// What the address names doesn't exist (a domain error from the services). Unmatched routes are handled by SHiFT.
const notFoundTags = ["NotFound", "TaskNotFound", "SubtaskNotFound", "ListNotFound"]

export const app = routes.pipe(
  Effect.provideServiceEffect(TimeZone, requestTimeZone),
  errorPages({
    notFound: page("notFound", {}, 404),
    serverError: page("serverError", {}, 500),
    isNotFound: (error) => notFoundTags.some((tag) => Predicate.isTagged(error, tag))
  }),
  theme,
  i18n.plugin,
  clientAssets(frontend)
)
