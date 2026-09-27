// Days on the calendar and times of day, without zones. A due date is a calendar day ("2026-09-28"), so "tomorrow"
// means the same day wherever the user is, and the calendar never does time zone arithmetic.
import { Schema } from "effect"

export const CalendarDate = Schema.String.pipe(Schema.pattern(/^\d{4}-\d{2}-\d{2}$/), Schema.brand("CalendarDate"))
export type CalendarDate = typeof CalendarDate.Type

/** "18:30", 24-hour clock. */
export const TimeOfDay = Schema.String.pipe(Schema.pattern(/^([01]\d|2[0-3]):[0-5]\d$/), Schema.brand("TimeOfDay"))
export type TimeOfDay = typeof TimeOfDay.Type

const DAY = 86_400_000

// Calendar arithmetic runs on UTC midnights, where every day is exactly 24 hours long.
const toUtc = (date: CalendarDate): number => {
  const [year, month, day] = date.split("-").map(Number) as [number, number, number]
  return Date.UTC(year, month - 1, day)
}
const fromUtc = (ms: number): CalendarDate => new Date(ms).toISOString().slice(0, 10) as CalendarDate

/** Builds a date; out-of-range days and months roll over (month 13 is January next year). */
export const calendarDate = (year: number, month: number, day: number): CalendarDate =>
  fromUtc(Date.UTC(year, month - 1, day))

export const dateParts = (date: CalendarDate): { year: number; month: number; day: number } => {
  const [year, month, day] = date.split("-").map(Number) as [number, number, number]
  return { year, month, day }
}

export const addDays = (date: CalendarDate, days: number): CalendarDate => fromUtc(toUtc(date) + days * DAY)

export const daysBetween = (from: CalendarDate, to: CalendarDate): number => Math.round((toUtc(to) - toUtc(from)) / DAY)

export const daysInMonth = (year: number, month: number): number => new Date(Date.UTC(year, month, 0)).getUTCDate()

/** Adds whole months and keeps the day where it can (Jan 31 + 1 month = Feb 28 or 29). */
export const addMonths = (date: CalendarDate, months: number, preferredDay?: number): CalendarDate => {
  const { year, month, day } = dateParts(date)
  const first = calendarDate(year, month + months, 1)
  const target = dateParts(first)
  return calendarDate(target.year, target.month, Math.min(preferredDay ?? day, daysInMonth(target.year, target.month)))
}

/** 0 = Sunday … 6 = Saturday, as in JavaScript. */
export const weekday = (date: CalendarDate): number => new Date(toUtc(date)).getUTCDay()

/** The Monday of the week the date is in (ISO weeks). */
export const startOfWeek = (date: CalendarDate): CalendarDate => addDays(date, -((weekday(date) + 6) % 7))

export const startOfMonth = (date: CalendarDate): CalendarDate => {
  const { year, month } = dateParts(date)
  return calendarDate(year, month, 1)
}

/** ISO dates compare correctly as strings. */
export const compareDates = (a: CalendarDate, b: CalendarDate): number => (a < b ? -1 : a > b ? 1 : 0)

/** The calendar day an instant falls on in a time zone. */
export const calendarDateAt = (epochMillis: number, timeZone: string): CalendarDate =>
  new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    epochMillis
  ) as CalendarDate
