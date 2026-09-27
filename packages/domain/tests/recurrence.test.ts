import { describe, expect, it } from "vitest"
import { CalendarDate } from "@todos/domain/calendar"
import { nextOccurrence } from "@todos/domain/recurrence"

const d = CalendarDate.make
// 2026-09-28 is a Monday.

describe("nextOccurrence", () => {
  it("repeats daily", () => {
    expect(nextOccurrence({ kind: "daily", every: 1 }, d("2026-09-28"))).toBe("2026-09-29")
    expect(nextOccurrence({ kind: "daily", every: 3 }, d("2026-09-30"))).toBe("2026-10-03")
  })

  it("repeats weekly on the due date's weekday", () => {
    expect(nextOccurrence({ kind: "weekly", every: 1, weekdays: [] }, d("2026-09-28"))).toBe("2026-10-05")
    expect(nextOccurrence({ kind: "weekly", every: 2, weekdays: [] }, d("2026-09-30"))).toBe("2026-10-14")
  })

  it("moves to the next chosen weekday, then wraps to the next week", () => {
    const monWedFri = { kind: "weekly", every: 1, weekdays: [1, 3, 5] } as const
    expect(nextOccurrence(monWedFri, d("2026-09-28"))).toBe("2026-09-30")
    expect(nextOccurrence(monWedFri, d("2026-09-30"))).toBe("2026-10-02")
    expect(nextOccurrence(monWedFri, d("2026-10-02"))).toBe("2026-10-05")
  })

  it("skips weeks only after the last chosen day", () => {
    const everyOtherMonWed = { kind: "weekly", every: 2, weekdays: [3, 1] } as const
    expect(nextOccurrence(everyOtherMonWed, d("2026-09-28"))).toBe("2026-09-30")
    expect(nextOccurrence(everyOtherMonWed, d("2026-09-30"))).toBe("2026-10-12")
  })

  it("treats Sunday as the end of the week", () => {
    const weekend = { kind: "weekly", every: 1, weekdays: [6, 0] } as const
    expect(nextOccurrence(weekend, d("2026-10-03"))).toBe("2026-10-04")
    expect(nextOccurrence(weekend, d("2026-10-04"))).toBe("2026-10-10")
  })

  it("repeats monthly and yearly, clamping to short months", () => {
    expect(nextOccurrence({ kind: "monthly", every: 1 }, d("2026-01-31"))).toBe("2026-02-28")
    expect(nextOccurrence({ kind: "monthly", every: 2 }, d("2026-09-15"))).toBe("2026-11-15")
    expect(nextOccurrence({ kind: "yearly", every: 1 }, d("2028-02-29"))).toBe("2029-02-28")
  })
})
