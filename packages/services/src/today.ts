// "Today" for the business logic: Effect's Clock, read in the user's time zone. The http layer provides the zone
// per request; tests fix both.
import { Clock, Context, Effect } from "effect"
import { calendarDateAt, type CalendarDate } from "@testin/domain/calendar"

/** The IANA time zone of the person asking, e.g. "Europe/Berlin". */
export class TimeZone extends Context.Tag("TimeZone")<TimeZone, string>() {}

export const today: Effect.Effect<CalendarDate, never, TimeZone> = Effect.gen(function* () {
  const now = yield* Clock.currentTimeMillis
  return calendarDateAt(now, yield* TimeZone)
})
