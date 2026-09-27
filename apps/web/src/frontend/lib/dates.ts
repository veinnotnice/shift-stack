// How dates and times read on screen, in the current language: "Tomorrow", "Friday", "3 Oct", "18:30".
import { daysBetween, type CalendarDate, type TimeOfDay } from "@todos/domain/calendar"
import { getLocale } from "#shared/paraglide/runtime.js"

// Calendar days carry no zone, so they are formatted at noon UTC and read back in UTC.
const asDate = (date: CalendarDate) => new Date(`${date}T12:00:00Z`)

const capitalize = (text: string) => text.charAt(0).toLocaleUpperCase(getLocale()) + text.slice(1)

/** Yesterday / Today / Tomorrow, the weekday within the coming week, else the date. */
export const dayLabel = (date: CalendarDate, today: CalendarDate): string => {
  const locale = getLocale()
  const offset = daysBetween(today, date)
  if (Math.abs(offset) <= 1) return capitalize(new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(offset, "day"))
  if (offset > 1 && offset < 7) return new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" }).format(asDate(date))
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: date.slice(0, 4) === today.slice(0, 4) ? undefined : "numeric",
    timeZone: "UTC"
  }).format(asDate(date))
}

/** "Monday, 28 September". */
export const longDate = (date: CalendarDate): string =>
  new Intl.DateTimeFormat(getLocale(), { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(asDate(date))

/** "18:30" or "6:30 PM", as the language writes it. */
export const timeLabel = (time: TimeOfDay): string =>
  new Intl.DateTimeFormat(getLocale(), { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(new Date(`1970-01-01T${time}:00Z`))
