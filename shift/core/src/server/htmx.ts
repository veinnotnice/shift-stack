// Responses that tell HTMX what to do next: raise events, navigate, fetch the page again.
import { HttpServerResponse } from "@effect/platform"
import { Effect } from "effect"
import { contentTarget, refreshEvent } from "#protocol"
import { href } from "./respond.ts"

/** HX-Trigger JSON. Non-ASCII is escaped because header values are sent as Latin-1. */
export const hxTrigger = (events: Record<string, unknown>): string =>
  JSON.stringify(events).replace(/[\u007f-￿]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`)

/** Raises events in the browser once the response is in: `response.pipe(trigger({ toast }))`. */
export const trigger =
  (events: Record<string, unknown>) =>
  (response: HttpServerResponse.HttpServerResponse): HttpServerResponse.HttpServerResponse =>
    HttpServerResponse.setHeader(response, "HX-Trigger", hxTrigger(events))

/** Tells HTMX to navigate to a path of the app, as a boosted link would. */
export const navigateTo = (path: string) =>
  Effect.map(href(path), (url) =>
    HttpServerResponse.empty({ status: 204 }).pipe(
      HttpServerResponse.setHeader("HX-Location", JSON.stringify({ path: url, target: `#${contentTarget}` }))
    )
  )

/** Tells the page to fetch its content again (after an undo, for example). */
export const refresh: HttpServerResponse.HttpServerResponse = HttpServerResponse.empty({ status: 204 }).pipe(
  trigger({ [refreshEvent]: true })
)
