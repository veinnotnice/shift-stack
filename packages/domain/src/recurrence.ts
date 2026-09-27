// How a task repeats, and when it is due next.
import { Schema } from "effect"
import { addDays, addMonths, dateParts, type CalendarDate, weekday } from "./calendar.ts"

const Every = Schema.Int.pipe(Schema.between(1, 365))

export const Recurrence = Schema.Union(
  Schema.Struct({ kind: Schema.Literal("daily"), every: Every }),
  // weekdays: 0 = Sunday … 6 = Saturday. Empty means "the weekday of the due date".
  Schema.Struct({
    kind: Schema.Literal("weekly"),
    every: Every,
    weekdays: Schema.Array(Schema.Int.pipe(Schema.between(0, 6)))
  }),
  Schema.Struct({ kind: Schema.Literal("monthly"), every: Every }),
  Schema.Struct({ kind: Schema.Literal("yearly"), every: Every })
)
export type Recurrence = typeof Recurrence.Type

/** The first occurrence strictly after `from`. */
export const nextOccurrence = (rule: Recurrence, from: CalendarDate): CalendarDate => {
  switch (rule.kind) {
    case "daily":
      return addDays(from, rule.every)
    case "weekly": {
      // Weeks start on Monday: count days as Monday = 0 … Sunday = 6.
      const fromMonday = (day: number) => (day + 6) % 7
      const days = (rule.weekdays.length > 0 ? rule.weekdays : [weekday(from)]).map(fromMonday).sort((a, b) => a - b)
      const today = fromMonday(weekday(from))
      const monday = addDays(from, -today)
      // The next chosen day later this week; else the first chosen day, `every` weeks on.
      const later = days.find((day) => day > today)
      return later !== undefined ? addDays(monday, later) : addDays(monday, rule.every * 7 + days[0]!)
    }
    case "monthly":
      return addMonths(from, rule.every, dateParts(from).day)
    case "yearly":
      return addMonths(from, rule.every * 12, dateParts(from).day)
  }
}
