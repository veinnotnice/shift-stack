import { describe, expect, it } from "vitest"
import {
  addDays,
  addMonths,
  calendarDate,
  calendarDateAt,
  CalendarDate,
  daysBetween,
  startOfWeek,
  weekday
} from "@todos/domain/calendar"

const d = CalendarDate.make

describe("calendar", () => {
  it("adds days across months and years", () => {
    expect(addDays(d("2026-12-31"), 1)).toBe("2027-01-01")
    expect(addDays(d("2026-03-01"), -1)).toBe("2026-02-28")
  })

  it("keeps the day when adding months, or takes the month's last day", () => {
    expect(addMonths(d("2026-01-15"), 1)).toBe("2026-02-15")
    expect(addMonths(d("2026-01-31"), 1)).toBe("2026-02-28")
    expect(addMonths(d("2028-01-31"), 1)).toBe("2028-02-29")
    expect(addMonths(d("2026-11-30"), 3)).toBe("2027-02-28")
  })

  it("counts days and knows weekdays and weeks", () => {
    expect(daysBetween(d("2026-09-27"), d("2026-10-04"))).toBe(7)
    expect(weekday(d("2026-09-28"))).toBe(1)
    expect(startOfWeek(d("2026-09-27"))).toBe("2026-09-21")
    expect(startOfWeek(d("2026-09-28"))).toBe("2026-09-28")
  })

  it("rolls over out-of-range parts", () => {
    expect(calendarDate(2026, 13, 1)).toBe("2027-01-01")
  })

  it("finds the calendar day of an instant in a time zone", () => {
    const lateEvening = Date.UTC(2026, 8, 27, 22, 30)
    expect(calendarDateAt(lateEvening, "UTC")).toBe("2026-09-27")
    expect(calendarDateAt(lateEvening, "Europe/Berlin")).toBe("2026-09-28")
    expect(calendarDateAt(lateEvening, "America/New_York")).toBe("2026-09-27")
  })
})
