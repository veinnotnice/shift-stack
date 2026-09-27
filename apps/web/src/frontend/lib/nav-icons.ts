// One icon per destination, shared by the server-rendered tab bar and the sidebar island.
import CalendarDays from "@lucide/svelte/icons/calendar-days"
import ListChecks from "@lucide/svelte/icons/list-checks"
import Sun from "@lucide/svelte/icons/sun"

export const navIcons = { today: Sun, calendar: CalendarDays, lists: ListChecks }

export type Destination = keyof typeof navIcons
