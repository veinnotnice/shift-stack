// The user's time zone for this request: the browser tells us in a cookie (src/frontend/islands/entry.ts sets it).
// Before it has, the configured default.
import { HttpServerRequest } from "@effect/platform"
import { Config, Effect } from "effect"

export const timeZoneCookie = "tz"

const isTimeZone = (zone: string): boolean => {
  try {
    new Intl.DateTimeFormat("en", { timeZone: zone })
    return true
  } catch {
    return false
  }
}

export const requestTimeZone = Effect.gen(function* () {
  const request = yield* HttpServerRequest.HttpServerRequest
  const fallback = yield* Config.string("DEFAULT_TIME_ZONE").pipe(Config.withDefault("Europe/Berlin"), Effect.orDie)
  const fromCookie = request.cookies[timeZoneCookie]
  return fromCookie !== undefined && isTimeZone(fromCookie) ? fromCookie : fallback
})
